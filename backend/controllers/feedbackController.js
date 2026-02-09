import db from "../config/db.js";
import { checkProfanity, Filter } from "glin-profanity";
import filipinoBadwords from "filipino-badwords-list";
import fs from "fs";
import e from "express";
import { em } from "framer-motion/client";
import { log } from "console";

export const createFeedback = async (req, res) => {
    const { rating, message, isAnonymous } = req.body;
    const accID = req.user.id;
    // Validate rating and message
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }
    if (!message || !message.trim()) {
        return res.status(400).json({ message: "Feedback message cannot be empty" });
    }
    const result = checkProfanity(message, {
      allLanguages: true,
      customWords: filipinoBadwords.array,
      replaceWith: "@!#*",
      replaceEachCharacter: true
    });

    const cleanedMessage = result.processedText;
    console.log("Original:", message, "Cleaned:", cleanedMessage);
    try {
        const queryString = `INSERT INTO feedbacks_tbl (accID, rating, message, isAnonymous) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(queryString, [accID, rating, cleanedMessage, isAnonymous]);
        res.status(201).json({ message: "Feedback submitted successfully", feedbackID: result.insertId });
    } catch (error) {
        console.error("Error creating feedback:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
    }
}

export const getAllFeedbacks = async (req, res) => {
    try {
        const queryString = `SELECT 
                                f.feedbackID, f.rating, f.message, f.isAnonymous, f.createdAt,
                                CONCAT(a.firstName, ' ', a.lastName) AS user_name
                            FROM feedbacks_tbl f 
                            JOIN account_tbl a ON f.accID = a.accId 
                            ORDER BY f.createdAt DESC`;
        const [feedbacks] = await db.query(queryString);
        
        if (!feedbacks.length) {
            return res.status(200).json({ feedbacks: [], message: "No feedbacks found." });
        }

        const cleanedFeedbacks = feedbacks.map(feedback => ({
            id: feedback.feedbackID,
            rating: feedback.rating,
            message: feedback.message,
            isAnonymous: Boolean(feedback.isAnonymous),
            createdAt: feedback.createdAt,
            user: {
                name: feedback.user_name
            }
        }));

        res.status(200).json({
            feedbacks: cleanedFeedbacks,
            message: "Feedbacks fetched successfully."
        });

    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({ message: "Failed to fetch feedbacks" });
    }
};

export const getAverageRating = async (req, res) => {
  try {
    const [result] = await db.query(`SELECT AVG(rating) AS average FROM feedbacks_tbl`);

    // Ensure average is always a number
    const rawAverage = result?.[0]?.average ?? 0;
    const average = Number(rawAverage) || 0; // convert string/null to number

    res.status(200).json({ average: parseFloat(average.toFixed(1)) });
  } catch (error) {
    console.error("DB error fetching average rating:", error);
    res.status(500).json({ message: "Failed to fetch average rating" });
  }
};