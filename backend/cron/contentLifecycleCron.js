import fs from "fs";
import path from "path";
import cron from "node-cron";
import db from "../config/db.js";
import { getIO } from "../socket.js";
import { removeNotificationsByReference } from "../controllers/notificationController.js";
import {
  deleteCloudinaryAssetByStoredName,
  isCloudinaryStoredName,
} from "../utils/cloudinary.js";
import { FORUM_UPLOADS_DIR } from "../utils/uploadPaths.js";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const ARCHIVE_RETENTION_DAYS = parsePositiveInt(process.env.ARCHIVE_RETENTION_DAYS, 30);
const CLEANUP_SCHEDULE = process.env.ARCHIVE_CLEANUP_CRON || "0 3 * * *";

const deleteForumImageAsset = async (imageName) => {
  if (!imageName) return;

  if (isCloudinaryStoredName(imageName)) {
    try {
      await deleteCloudinaryAssetByStoredName(imageName, "image");
    } catch (error) {
      console.error(`⚠️ Failed to remove Cloudinary forum image ${imageName}:`, error.message);
    }
    return;
  }

  const localImagePath = path.join(FORUM_UPLOADS_DIR, imageName);
  if (!fs.existsSync(localImagePath)) return;

  try {
    fs.unlinkSync(localImagePath);
  } catch (error) {
    console.error(`⚠️ Failed to remove local forum image ${imageName}:`, error.message);
  }
};

const safeGetIo = () => {
  try {
    return getIO();
  } catch {
    return null;
  }
};

const cleanupArchivedContent = async () => {
  const cutoffDate = new Date(Date.now() - ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [statusRows] = await connection.query(
      `SELECT pubStatsID
       FROM publication_status_tbl
       WHERE LOWER(pubStatus) = 'archived'
       LIMIT 1`
    );

    if (!statusRows.length) {
      await connection.rollback();
      console.warn("⚠️ Archived publication status not found. Skipping content lifecycle cleanup.");
      return;
    }

    const archivedStatusId = statusRows[0].pubStatsID;

    const [tipRows] = await connection.query(
      `SELECT petCareID, title
       FROM pet_care_tips_content_tbl
       WHERE isDeleted = 0
         AND pubStatusID = ?
         AND COALESCE(lastUpdated, createdAt) < ?`,
      [archivedStatusId, cutoffDate]
    );

    const [videoRows] = await connection.query(
      `SELECT videoID, videoTitle
       FROM video_content_tbl
       WHERE isDeleted = 0
         AND pubStatusID = ?
         AND COALESCE(lastUpdated, createdAt) < ?`,
      [archivedStatusId, cutoffDate]
    );

    const [forumRows] = await connection.query(
      `SELECT forumID
       FROM forum_posts_tbl
       WHERE isDeleted = 1
         AND COALESCE(lastUpdatedAt, createdAt) < ?`,
      [cutoffDate]
    );

    const tipIds = tipRows.map((row) => Number(row.petCareID)).filter(Boolean);
    const videoIds = videoRows.map((row) => Number(row.videoID)).filter(Boolean);
    const forumIds = forumRows.map((row) => Number(row.forumID)).filter(Boolean);

    let forumImageRows = [];
    if (forumIds.length > 0) {
      const [images] = await connection.query(
        `SELECT forumID, imageName
         FROM forum_images_tbl
         WHERE forumID IN (?)`,
        [forumIds]
      );
      forumImageRows = images;
    }

    if (tipIds.length > 0) {
      await connection.query(
        `DELETE FROM pet_care_tips_content_tbl
         WHERE petCareID IN (?)`,
        [tipIds]
      );
    }

    if (videoIds.length > 0) {
      await connection.query(
        `DELETE FROM video_content_tbl
         WHERE videoID IN (?)`,
        [videoIds]
      );
    }

    if (forumIds.length > 0) {
      await connection.query("DELETE FROM forum_images_tbl WHERE forumID IN (?)", [forumIds]);
      await connection.query("DELETE FROM forum_posts_tbl WHERE forumID IN (?)", [forumIds]);
    }

    await connection.commit();

    for (const tipId of tipIds) {
      await removeNotificationsByReference("pet_care_tips_content_tbl", tipId);
    }

    for (const videoId of videoIds) {
      await removeNotificationsByReference("video_content_tbl", videoId);
    }

    for (const forumId of forumIds) {
      await removeNotificationsByReference("forum_posts_tbl", forumId);
    }

    for (const image of forumImageRows) {
      await deleteForumImageAsset(image.imageName);
    }

    const io = safeGetIo();
    if (io) {
      for (const tip of tipRows) {
        io.emit("pet_care_tip_deleted", { id: Number(tip.petCareID) });
        io.to("admin-room").emit("admin_tip_deleted", {
          tipId: Number(tip.petCareID),
          tipTitle: tip.title,
          adminName: "System",
          adminId: 0,
          timestamp: new Date(),
          reason: "archive_retention_expired",
        });
      }

      for (const video of videoRows) {
        io.emit("video_deleted", { dbId: Number(video.videoID) });
        io.to("admin-room").emit("admin_video_deleted", {
          videoId: Number(video.videoID),
          videoTitle: video.videoTitle,
          adminName: "System",
          adminId: 0,
          timestamp: new Date(),
          reason: "archive_retention_expired",
        });
      }

      for (const forumId of forumIds) {
        io.emit("delete_forum_post", { postId: Number(forumId) });
        io.emit("forum_post_deleted", { postId: Number(forumId) });
      }
    }

    if (tipIds.length || videoIds.length || forumIds.length) {
      // Cleanup completed with at least one deleted record.
    }
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Error running content lifecycle cleanup:", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

cleanupArchivedContent();
cron.schedule(CLEANUP_SCHEDULE, cleanupArchivedContent);
