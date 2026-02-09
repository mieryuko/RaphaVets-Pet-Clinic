// server.js
import express from "express";
import cors from "cors";
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
import contentManagementRoute from './routes/admin_routes/contentManagementRoute.js';
import appointmentVisitRoute from "./routes/admin_routes/appointmentVisitRoute.js";
import labRecordRoute from './routes/admin_routes/labRecordRoute.js';
import medicalRecordsRoute from './routes/labRecordsRoute.js';
import chatRoutes from './routes/chatRoute.js';


const app = express();

app.use(cors());
app.use(express.json());

// Routes
//login route
app.use("/api/auth", authRoutes);
//user route
app.use("/api/users", userRoute);
//feedback route
app.use("/api/feedback", feedbackRoutes);
//forum route
app.use("/api/forum", forumRoutes);
//appointment route
app.use("/api/appointment", appointmentRoute);
//pet routes
app.use("/api/pets", petRoute);
//pet care tips route
app.use("/api/pet-care-tips", petCareTipsRoutes);
app.use("/api/videos", videoRoutes);

// ADMIN SIDE ROUTES
app.use("/api/admin", clientRoute);
app.use("/api/admin/dashboard", dashboardRoute);
//content management route
app.use('/api/admin/content', contentManagementRoute);
//admin appointment route
app.use("/api/admin/appointments", appointmentVisitRoute);
//lab/medical records
app.use('/api/admin/pet-records', labRecordRoute);

app.use('/api/medical-records', medicalRecordsRoute);

// Chatbot route
app.use("/api/chatbot", chatRoutes);


// Serve uploaded pet images
app.use("/uploads", express.static("uploads"));

// Test route to verify server
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected!" });
});




app.listen(5000, () => console.log("✅ Server running on port 5000"));
