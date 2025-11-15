import express from "express";
import { 
    getOwnersWithPets,
    getBreed,
    getSpecies,
    createPet,
    updatePet,
    createOwner,    // Add this
    updateOwner     // Add this
} from "../../controllers/admin_controllers/ownerAndPetsController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/owners-with-pets", verifyToken, allowRoles(2, 3), getOwnersWithPets);
router.get("/breeds", verifyToken, allowRoles(2, 3), getBreed);
router.get("/species", verifyToken, allowRoles(2, 3), getSpecies);

// Pet routes
router.post("/add-pets", verifyToken, allowRoles(2, 3), createPet);
router.put("/update-pet/:petId", verifyToken, allowRoles(2, 3), updatePet);

// Owner routes - ADD THESE
router.post("/add-owner", verifyToken, allowRoles(2, 3), createOwner);
router.put("/update-owner/:ownerId", verifyToken, allowRoles(2, 3), updateOwner);

export default router;