import db from "../config/db.js";
import path from "path";
import fs from "fs";
import e from "express";
import { em } from "framer-motion/client";
import { log } from "console";


export const createPost = async (req, res) => {
    const {postType, description, contact, email, isAnonymous} = req.body;
    const accID = req.user.id;

    {/* Validate required fields */}
    if(!postType || !['Lost', 'Found'].includes(postType)){
        return res.status(400).json({ message: "❌ Invalid post type." });
    }
    if(!description?.trim()){
        return res.status(400).json({ message: "❌ Please provide a description." });
    }
    if(!contact?.trim() && !email?.trim()){
        return res.status(400).json({ message: "❌ Please provide a contact number or email address." });
    }
    if(contact?.trim() && !/^(09\d{9}|\+63\d{10})$/.test(contact)){
        return res.status(400).json({ message: "❌ Invalid contact number format." });
    }
    if(email?.trim() && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)){
        return res.status(400).json({ message: "❌ Invalid email format." });
    }

    {/* Validate images */}
    if(req.files?.length < 1){
        return res.status(400).json({ message: "❌ Please provide at least 1 image" });
    }
    if(req.files.length > 5){
        return res.status(400).json({ message: "❌ Maximum of 5 images allowed." });
    }

    const dbConn = await db.getConnection();
    try {
      await dbConn.beginTransaction();
      const [result] = await dbConn.query(
          "INSERT INTO forum_posts_tbl (accID, postType, description, contact, email, isAnonymous) VALUES (?, ?, ?, ?, ?, ?)",
          [accID, postType, description, contact, email, isAnonymous]
      );

      const forumID = result.insertId

      if (req.files?.length > 0) {
          const imageData = req.files.map(file => [forumID, file.filename]);
          await dbConn.query(
              "INSERT INTO forum_images_tbl (forumID, imageName) VALUES ?",
              [imageData]
          );
    }

    await dbConn.commit();
    res.status(201).json({ id: result.insertId, accID, postType, description, contact, email, isAnonymous });
  } catch (error) {
    await dbConn.rollback();
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    dbConn.release();
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      "SELECT " +
        "p.forumID, " +
        "p.postType, " +
        "p.description, " +
        "p.contact, " +
        "p.email, " +
        "if(p.isAnonymous, 'Anonymous', CONCAT(a.firstName, ' ', a.lastName)) AS userName, " +
        "p.createdAt,  " +
        "p.lastUpdatedAt, " +
        "p.accID, " +
        "p.isAnonymous " + 
      "FROM forum_posts_tbl p " +
      "JOIN account_tbl a ON p.accID = a.accID " +
      "WHERE p.isDeleted = FALSE AND a.isDeleted = FALSE " +
      "ORDER BY GREATEST(p.createdAt, p.lastUpdatedAt) DESC " +
      "LIMIT 20"
    );
    if(!posts.length){
      return res.status(200).json({ message: "✅ No posts found.", posts: [] });
    }
    const postIds = posts.map(post => post.forumID).filter(formID => formID != null);

    const placeholder = postIds.map(() => '?').join(',');

    const [images] = await db.query(
      `SELECT * FROM forum_images_tbl WHERE forumID IN (${placeholder} ) AND isDeleted = FALSE`,
      postIds
    );

    const cleanedPosts = posts.map(post => {
      const createdAt = new Date(post.createdAt);
      const lastUpdatedAt = new Date(post.lastUpdatedAt);
      const isEdited = Math.abs(lastUpdatedAt - createdAt) > 1000;// 1 second threshold
      
      const createdAtStr = createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const lastUpdatedAtStr = lastUpdatedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateDisplay = isEdited
        ? `${createdAtStr} (Edited: ${lastUpdatedAtStr})`
        : createdAtStr;
      return{
        id: post.forumID,
        type: post.postType,
        user: post.userName,
        petName: post.petName || "Unknown",
        images: images
          .filter(img => img.forumID === post.forumID)
          .map(img => ({
            id: img.forumImageID,
            url: `${req.protocol}://${req.get('host')}/api/forum/images/${img.imageName}`,
            imageName: img.imageName,
          })),
        desc: post.description,
        contact: post.contact,
        email: post.email,
        date: dateDisplay,
        accID: post.accID,
        anonymous: Boolean(post.isAnonymous),
      }
    });


    res.status(200).json({
      message: "✅ Posts fetched successfully",
      posts: cleanedPosts
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => { 
    const { postType, description, contact, email, isAnonymous, deletedImages } = req.body;

     {/* Validate required fields */}
    const updates = {};
    if (postType !== undefined) updates.postType = postType;
    if (description !== undefined) updates.description = description;
    if (contact !== undefined) updates.contact = contact;
    if (email !== undefined) updates.email = email;
    if (isAnonymous !== undefined) updates.isAnonymous = isAnonymous;

    {/* Validate required fields */}
    if (postType !== undefined && !['Lost', 'Found'].includes(postType)) {
      return res.status(400).json({ message: "❌ Invalid post type." });
    }
    if(description !== undefined && !description?.trim()){
        return res.status(400).json({ message: "❌ Please provide a description." });
    }
    if(contact !== undefined && !contact?.trim() && email !== undefined && !email?.trim()){
        return res.status(400).json({ message: "❌ Please provide a contact number or email address." });
    }
    if(contact !== undefined && contact?.trim() && !/^(09\d{9}|\+63\d{10})$/.test(contact)){
        return res.status(400).json({ message: "❌ Invalid contact number format." });
    }
    if(email !== undefined && email?.trim() && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)){
        return res.status(400).json({ message: "❌ Invalid email format." });
    }

    const deletedArray = deletedImages
        ? Array.isArray(deletedImages)
            ? deletedImages
            : [deletedImages]
        : [];

    const newImages = req.files || [];

    if (Object.keys(updates).length === 0 &&
        newImages.length === 0 &&
         (deletedArray.length === 0)) {
        return res.status(400).json({ message: "❌ No updates detected." });
    }
    const dbConn = await db.getConnection();

    let setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(req.params.id); // forumID for WHERE clause
    try {
      await dbConn.beginTransaction();

      //Handle forum updates
      if (!setClause) {
          setClause += 'lastUpdatedAt = NOW()';
      }
      const [result] = await dbConn.query(
          `UPDATE forum_posts_tbl SET ${setClause} WHERE forumID = ?`,
          values
      );
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "❌ Post not found." });
      }

      //Check post-update image count
      const [forumImageCount] = await dbConn.query(
        "SELECT COUNT(DISTINCT forumImageID) as imageCount " + 
        "FROM forum_images_tbl " +
        "WHERE forumID = ? AND isDeleted = FALSE",
        req.params.id
      );
      const existingCount = forumImageCount[0].imageCount;
      console.log("Existing images: ", existingCount);
      console.log("Deleting images: ", deletedArray.length);
      console.log("New Images: ", newImages.length);
      const remainingImages = existingCount - deletedArray.length + newImages.length;
      console.log("remainingImages: ", remainingImages)
      if (remainingImages < 1){
        return res.status(400).json({ message: "❌ Please provide at least 1 image" });
      }

      //Handle deleted images
      for (const imgId of deletedArray) {
          const [imgRows] = await dbConn.query(
              "SELECT imageName FROM forum_images_tbl WHERE forumImageID = ? AND forumID = ? AND isDeleted = FALSE",
              [imgId, req.params.id]
          );
          await dbConn.query(
              "UPDATE forum_images_tbl SET isDeleted = TRUE WHERE forumImageID = ? AND forumID = ?",
              [imgId, req.params.id]
          );
          if (imgRows.length) {
              const imagePath = path.join(process.cwd(), '..', 'uploads/forum', imgRows[0].imageName);
              if (fs.existsSync(imagePath)) {
                  fs.unlink(imagePath, (err) => {
                      if (err) {
                          console.error(`❌ Error deleting image file ${imgRows[0].imageName}:`, err);
                      } else {
                          console.log(`✅ Deleted image file: ${imgRows[0].imageName}`);
                      }
                  });
              }
          }
      }  
      //Handle new images
      if (newImages.length > 0) {
          const imageData = newImages.map(file => [req.params.id, file.filename]);
          await dbConn.query(
              "INSERT INTO forum_images_tbl (forumID, imageName) VALUES ?",
              [imageData]
          );
      }

      await dbConn.commit();
      res.status(200).json({ message: "✅ Post updated successfully." });
    } catch (error) {
      await dbConn.rollback();
      console.error("❌ Error updating post:", error);
      res.status(500).json({ message: "Server error" });
    }finally {
      dbConn.release();
    } 
};

export const deletePost = async (req, res) => {
    const forumID = req.params.id;
    const dbConn = await db.getConnection();
    try {
        await dbConn.beginTransaction();
        const [result] = await dbConn.query(
            "UPDATE forum_posts_tbl SET isDeleted = TRUE WHERE forumID = ?",
            [forumID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "❌ Post not found." });
        }
        const [images] = await dbConn.query(
            "SELECT imageName FROM forum_images_tbl WHERE forumID = ?",
            [forumID]
        );
        await dbConn.query(
            "UPDATE forum_images_tbl SET isDeleted = TRUE WHERE forumID = ?",
            [forumID]
        );

        for (const img of images) {
            const imagePath = path.join(process.cwd(), '..', 'uploads/forum', img.imageName);
            if (!fs.existsSync(imagePath)) continue;
            fs.unlink(imagePath, async (err) => {
                if (err) {
                    console.error(`❌ Error deleting image file ${img.imageName}:`, err);
                    await dbConn.rollback();
                    return res.status(500).json({ message: "❌ Error deleting image file: " + err.message });
                } else {
                    console.log(`✅ Deleted image file: ${img.imageName}`);
                }
            });
        }
        await dbConn.commit();
        res.status(200).json({ message: "✅ Post deleted successfully." });
    } catch (error) {
        await dbConn.rollback();
        console.error("❌ Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post: " + error.message });
    }finally {
        dbConn.release();
    }
};