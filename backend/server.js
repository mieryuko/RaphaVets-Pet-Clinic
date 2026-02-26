// backend/server.js
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initializeSocket } from "./socket.js"; // IMPORT the socket initializer
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import userRoute from "./routes/userRoute.js";
import appointmentRoute from "./routes/appointmentRoute.js";
import petRoute from "./routes/petRoute.js";
import clientRoute from "./routes/admin_routes/ownerAndPetRoute.js"
import dashboardRoute from "./routes/admin_routes/dashboardRoute.js"
import petCareTipsRoutes from './routes/petCareTipsRoute.js';
import videoRoutes from './routes/videoRoute.js';
import faqRoute from './routes/faqRoute.js';
import contentManagementRoute from './routes/admin_routes/contentManagementRoute.js';
import appointmentVisitRoute from "./routes/admin_routes/appointmentVisitRoute.js";
import labRecordRoute from './routes/admin_routes/labRecordRoute.js';
import medicalRecordsRoute from './routes/labRecordsRoute.js';
import chatRoutes from './routes/chatRoute.js';
import breedDetectRoute from './routes/ml_routes/breedDetectRoute.js';
import dotenv from "dotenv";
import supportRoute from './routes/supportRoute.js';
import notificationRoute from './routes/notificationRoute.js';

dotenv.config();

const app = express();
const server = createServer(app);

// IMPORTANT: Use the initializeSocket function from socket.js
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoute);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/appointment", appointmentRoute);
app.use("/api/pets", petRoute);
app.use("/api/pet-care-tips", petCareTipsRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/faqs", faqRoute);
app.use("/api/notifications", notificationRoute);

// ADMIN SIDE ROUTES
app.use("/api/admin", clientRoute);
app.use("/api/admin/dashboard", dashboardRoute);
app.use('/api/admin/content', contentManagementRoute);
app.use("/api/admin/appointments", appointmentVisitRoute);
app.use('/api/admin/pet-records', labRecordRoute);
app.use('/api/medical-records', medicalRecordsRoute);
app.use("/api/chatbot", chatRoutes);
app.use('/api/support', supportRoute);
app.use("/uploads", express.static("uploads"));
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});
app.use("/api/ml", breedDetectRoute);

server.listen(5000, () => console.log("✅ Server running on port 5000"));