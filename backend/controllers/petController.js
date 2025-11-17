import db from "../config/db.js";

// Helper to compute age
const calculateAge = (dob) => {
  if (!dob) return "Unknown";
  
  const birth = new Date(dob);
  // Handle invalid dates (like '0000-00-00' from your database)
  if (isNaN(birth.getTime())) return "Unknown";
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} yrs`;
};

// Get pets for the logged-in user
export const getUserPets = async (req, res) => {
  try {
    const accID = req.user?.id;
    if (!accID) return res.status(401).json({ message: "User not authenticated" });

    const [rows] = await db.query(
      `SELECT p.petID, p.petName, p.petGender, b.breedName AS breed,
              p.dateOfBirth, p.weight_kg, p.imageName, p.color, p.note
         FROM pet_tbl p
         JOIN breed_tbl b ON p.breedID = b.breedID
        WHERE p.accID = ? AND p.isDeleted = 0`,
      [accID]
    );

    const pets = rows.map((p) => ({
      id: p.petID,
      name: p.petName,
      gender: p.petGender,
      breed: p.breed,
      age: calculateAge(p.dateOfBirth),
      image: p.imageName
        ? `/api/pets/images/${p.imageName}`
        : "/images/dog-profile.png",
      weight: p.weight_kg,
      color: p.color,
      note: p.note
    }));

    res.json(pets);
  } catch (err) {
    console.error("❌ getUserPets Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single pet details
export const getPetDetails = async (req, res) => {
  try {
    const petID = req.params.id;

    const [petRows] = await db.query(
      `SELECT p.petID, p.petName, p.petGender, b.breedName AS breed,
              p.dateOfBirth, p.weight_kg, p.imageName, p.color, p.note
         FROM pet_tbl p
         JOIN breed_tbl b ON p.breedID = b.breedID
        WHERE p.petID = ? AND p.isDeleted = 0`,
      [petID]
    );

    if (!petRows.length)
      return res.status(404).json({ message: "Pet not found" });

    const pet = petRows[0];

    // Get pet's appointments - FIXED: Using correct column names from your database
    const [appointments] = await db.query(
      `SELECT 
          a.appointmentID AS id,
          p.petName,
          CONCAT(acc.firstName, ' ', acc.lastName) AS ownerName,
          s.service AS type,
          CONCAT(DATE_FORMAT(a.appointmentDate, '%b %e, %Y'), ' - ', st.scheduleTime) AS date,
          ast.statusName AS status
       FROM appointment_tbl a
       JOIN pet_tbl p ON a.petID = p.petID
       JOIN service_tbl s ON a.serviceID = s.serviceID
       JOIN account_tbl acc ON a.accID = acc.accId
       JOIN scheduletime_tbl st ON a.scheduledTimeID = st.scheduledTimeID
       JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
       WHERE a.petID = ?
       ORDER BY a.appointmentDate DESC`,
      [petID]
    );

    res.json({
      id: pet.petID,
      name: pet.petName,
      gender: pet.petGender,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth,
      age: calculateAge(pet.dateOfBirth),
      weight: pet.weight_kg,
      color: pet.color,
      note: pet.note,
      image: pet.imageName
        ? `/api/pets/images/${pet.imageName}`
        : "/images/dog-profile.png",
      appointments,
    });

  } catch (err) {
    console.error("❌ getPetDetails Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload a single pet image
export const uploadPetImage = async (req, res) => {
  try {
    const petID = req.params.id;

    if (!req.file)
      return res.status(400).json({ message: "❌ No image uploaded" });

    const imageName = req.file.filename;

    // Check if pet exists and belongs to the authenticated user
    const [petRows] = await db.query(
      "SELECT petID FROM pet_tbl WHERE petID = ? AND accID = ? AND isDeleted = 0",
      [petID, req.user?.id]
    );

    if (!petRows.length) {
      return res.status(404).json({ message: "Pet not found or access denied" });
    }

    await db.query("UPDATE pet_tbl SET imageName = ? WHERE petID = ?", [
      imageName,
      petID,
    ]);

    res.json({
      message: "✅ Image uploaded successfully",
      imageUrl: `/api/pets/images/${imageName}`,
    });
  } catch (err) {
    console.error("❌ uploadPetImage Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};