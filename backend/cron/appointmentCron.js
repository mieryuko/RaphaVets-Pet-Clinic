import db from "../config/db.js";
import cron from "node-cron";
import { connect } from "socket.io-client";

// Schedule the task to run every day at midnight
const markMissedAppointments = async () => {
  const connection = await db.getConnection();
  try {
    connection.beginTransaction();

    // Fetch status IDs for "Upcoming", "Pending", and "Missed"
    const [statusRows] = await connection.query(
      "SELECT statusID, statusName FROM appointment_status_tbl",
    );
    const upcomingStatusID = statusRows.find(
      (status) => status.statusName === "Upcoming",
    )?.statusID;
    const pendingStatusID = statusRows.find(
      (status) => status.statusName === "Pending",
    )?.statusID;
    const missedStatusID = statusRows.find(
      (status) => status.statusName === "Missed",
    )?.statusID;

    if (!pendingStatusID || !missedStatusID) {
      connection.rollback();
      throw new Error(
        "Pending or Missed status not found in appointment_status_tbl",
      );
    }

    // Update appointments that are past their scheduled date and not yet marked as missed
    const [result] = await connection.query(
      `UPDATE appointment_tbl a
        JOIN scheduletime_tbl s ON s.scheduledTimeID = a.scheduledTimeID
        JOIN appointment_status_tbl st_upcoming ON st_upcoming.statusName = 'Upcoming'
        JOIN appointment_status_tbl st_missed ON st_missed.statusName = 'Missed'
        SET a.statusID = st_missed.statusID
        WHERE TIMESTAMP(a.appointmentDate, CAST(s.scheduleTime AS TIME)) < NOW() - INTERVAL 1 HOUR
        AND a.statusID = st_upcoming.statusID;
        `,
    );

    if (result.affectedRows > 0) {
      console.log(`✅ Marked ${result.affectedRows} appointments as missed`);
    }
    connection.commit();
  } catch (err) {
    connection.rollback();
    console.error("❌ Error marking missed appointments:", err);
  } finally {
    connection.release();
  }
};

markMissedAppointments(); // Run immediately on startup

const EVERY_10_MINUTES = "*/10 * * * *";
const EVERY_10_SECONDS = "*/10 * * * * *"; // For testing purposes, change to every 10 minutes in production
cron.schedule(EVERY_10_SECONDS, markMissedAppointments);
