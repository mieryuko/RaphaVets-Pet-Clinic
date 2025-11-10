import db from "../config/db.js";

// Helper to calculate pet age
const calculateAge = (dob) => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age + " years old";
};

// Get pets for logged-in user
export const getUserPets = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("Fetching pets for userId:", req.user.id); // ✅ Check the userId

    const [rows] = await db.query(
      `SELECT p.petID, p.petName, p.breedID, b.breedName AS breed, p.dateOfBirth, p.weight_kg, p.imageName
       FROM pet_tbl p
       JOIN breed_tbl b ON p.breedID = b.breedID
       WHERE p.accID = ? AND p.isDeleted = 0`,
      [req.user.id]
    );

    console.log("Pets fetched from DB:", rows); // ✅ See if DB returns any rows

    const pets = rows.map(p => ({
      id: p.petID,
      name: p.petName,
      breed: p.breed,
      age: calculateAge(p.dateOfBirth),
      image: p.imageName, // Using the correct field name from the database
      weight: p.weight_kg
    }));

    res.json(pets);
  } catch (err) {
    console.error("❌ Failed to fetch pets:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getPetDetails = async (req, res) => {
  const petID = req.params.id;

  try {
    // Fetch pet info
    const [petRows] = await db.query(
      `SELECT p.petID, p.petName, p.gender, b.breedName AS breed, p.dateOfBirth, p.weight_kg, p.imageName
       FROM pet_tbl p
       JOIN breed_tbl b ON p.breedID = b.breedID
       WHERE p.petID = ? AND p.isDeleted = 0`,
      [petID]
    );

    if (!petRows.length) return res.status(404).json({ message: "Pet not found" });
    const pet = petRows[0];

    // Fetch appointments for this pet
    const [appointments] = await db.query(
      `SELECT 
          a.appointmentID AS id,
          s.service AS type,
          CONCAT(DATE_FORMAT(a.appointmentDate, '%b %e, %Y'), ' - ', a.startTime) AS date,
          CASE 
            WHEN a.statusID = 1 THEN 'Pending'
            WHEN a.statusID = 2 THEN 'Upcoming'
            WHEN a.statusID = 3 THEN 'Done'
            ELSE 'Unknown'
          END AS status
       FROM appointment_tbl a
       JOIN service_tbl s ON a.serviceID = s.serviceID
       WHERE a.petID = ? 
       ORDER BY a.appointmentDate DESC`,
      [petID]
    );

    res.json({ ...pet, appointments });
    console.log(petRows);
    } catch (err) {
    console.error("❌ Error fetching pet details:", err);
    res.status(500).json({ message: "Server error" });
  }
};
