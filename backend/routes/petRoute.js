import express from "express";
import { 
    getUserPets,
    getPetDetails,
} from "../controllers/petController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test root
// router.get("/", (req, res) => {
//   res.json({ message: "✅ /api/pets root reached" });
// });

// Get pets for logged-in user
router.get("/", verifyToken, getUserPets);
router.get("/:id", verifyToken, getPetDetails);
export default router;
