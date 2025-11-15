  import db from "../../config/db.js";

  export const getOwnersWithPets = async (req, res) => {
  try {
    // fetch all owners (roleID = 1)
    const [owners] = await db.execute(`
      SELECT 
        a.accId,
        CONCAT(a.firstName, ' ', a.lastName) AS name,
        a.email,
        c.gender,
        c.dateOfBirth,
        c.address,
        c.contactNo,
        a.createdAt
      FROM account_tbl a
      LEFT JOIN clientinfo_tbl c ON a.accId = c.accId
      WHERE a.roleID = 1 AND a.isDeleted = 0
    `);

    // fetch all pets - make sure we're returning species as petType
    const [pets] = await db.execute(`
      SELECT 
        p.*,
        b.breedName,
        b.species AS petType
      FROM pet_tbl p
      JOIN breed_tbl b ON p.breedID = b.breedID
      WHERE p.isDeleted = 0
    `);

    // group pets to their owner
    const results = owners.map(owner => ({
      ...owner,
      pets: pets.filter(p => p.accID === owner.accId)
    }));

    res.status(200).json(results);

  } catch (err) {
    console.error("Error (owners-with-pets):", err);
    res.status(500).json({ error: "Server error" });
  }
};

  export const getBreed = async (req, res) => {
    try {
      const speciesQuery = req.query.species; // expects 'Canine' or 'Feline'
      let query = "SELECT * FROM breed_tbl";
      const params = [];

      if (speciesQuery) {
        query += " WHERE species = ?";
        params.push(speciesQuery);
      }

      const [rows] = await db.execute(query, params);

      // return array of breed names only
      const breedNames = rows.map(r => r.breedName);

      res.status(200).json(breedNames);
    } catch (error) {
      console.error("Error fetching breeds:", error);
      res.status(500).json({ message: "Failed to fetch breeds", error: error.message });
    }
  };

  export const getSpecies = async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT DISTINCT species FROM breed_tbl");
      const species = rows.map(r => r.species);
      res.status(200).json(species);
    } catch (error) {
      console.error("Error fetching species:", error);
      res.status(500).json({ message: "Failed to fetch species", error: error.message });
    }
  };

  export const createPet = async (req, res) => {
    try {
      const {
        ownerId,
        type,
        breed,
        name,
        age,
        sex,
        weight,
        color,
        dob,
        notes
      } = req.body;

      if (!ownerId || !type || !breed || !name) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Fetch breedID from breed_tbl
      const [breedRow] = await db.execute(
        "SELECT breedID FROM breed_tbl WHERE breedName = ? LIMIT 1",
        [breed]
      );

      if (breedRow.length === 0) {
        return res.status(400).json({ message: "Invalid breed" });
      }

      const breedID = breedRow[0].breedID;

      // Insert new pet
      await db.execute(
        `INSERT INTO pet_tbl 
          (accID, breedID, petName, petGender, weight_kg, color, dateOfBirth, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ownerId,
          breedID,
          name,
          sex || null,
          weight || null,
          color || null,
          dob || null,
          notes || null
        ]
      );

      console.log("REQ BODY:", req.body);
      const petData = req.body;

  console.log("Saving pet data:", petData);

      res.status(201).json({ message: "Pet created successfully" });

    } catch (err) {
      console.log("REQ BODY:", req.body);

      console.error("Error creating pet:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  export const updatePet = async (req, res) => {
    try {
      const { petId } = req.params; // <-- get from URL
      const { type, breed, name, age, sex, weight, color, dob, notes } = req.body;

      if (!petId) {
        return res.status(400).json({ message: "Pet ID is required" });
      }

      // Fetch breedID if breed is provided
      let breedID = null;
      if (breed) {
        const [breedRow] = await db.execute(
          "SELECT breedID FROM breed_tbl WHERE breedName = ? LIMIT 1",
          [breed]
        );
        if (breedRow.length === 0) {
          return res.status(400).json({ message: "Invalid breed" });
        }
        breedID = breedRow[0].breedID;
      }

      // Update the pet
      await db.execute(
        `UPDATE pet_tbl SET 
          ${breedID ? "breedID = ?, " : ""}
          petName = ?,
          petGender = ?,
          weight_kg = ?,
          color = ?,
          dateOfBirth = ?,
          note = ?
        WHERE petID = ?`,
        [
          ...(breedID ? [breedID] : []),
          name,
          sex || null,
          weight || null,
          color || null,
          dob || null,
          notes || null,
          petId
        ]
      );

      res.status(200).json({ message: "Pet updated successfully" });

    } catch (err) {
      console.error("Error updating pet:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

export const createOwner = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      sex,
      dob,
      pets // Array of pets (optional)
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, phone" });
    }

    // Start transaction since we're doing multiple operations
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Create account in account_tbl
      const [accountResult] = await connection.execute(
        `INSERT INTO account_tbl 
         (firstName, lastName, email, roleID, isDeleted, createdAt) 
         VALUES (?, ?, ?, 1, 0, NOW())`,
        [firstName, lastName, email]
      );

      const accId = accountResult.insertId;

      // 2. Create client info in clientinfo_tbl
      await connection.execute(
        `INSERT INTO clientinfo_tbl 
         (accId, gender, dateOfBirth, address, contactNo) 
         VALUES (?, ?, ?, ?, ?)`,
        [accId, sex || null, dob || null, address || null, phone]
      );

      // 3. If pets are provided, create them in pet_tbl
      if (pets && pets.length > 0) {
        for (const pet of pets) {
          if (pet.name && pet.type && pet.breed) {
            // Get breedID
            const [breedRow] = await connection.execute(
              "SELECT breedID FROM breed_tbl WHERE breedName = ? LIMIT 1",
              [pet.breed]
            );

            if (breedRow.length === 0) {
              await connection.rollback();
              return res.status(400).json({ message: `Invalid breed: ${pet.breed}` });
            }

            const breedID = breedRow[0].breedID;

            // Insert pet
            await connection.execute(
              `INSERT INTO pet_tbl 
               (accID, breedID, petName, petGender, weight_kg, color, dateOfBirth, note) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                accId,
                breedID,
                pet.name,
                pet.sex || null,
                pet.weight || null,
                pet.color || null,
                pet.dob || null,
                pet.notes || null
              ]
            );
          }
        }
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      res.status(201).json({ 
        message: "Owner and pets created successfully",
        accId: accId
      });

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (err) {
    console.error("Error creating owner:", err);
    
    // Check for duplicate email
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      sex,
      dob
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Update account_tbl
      await connection.execute(
        `UPDATE account_tbl 
         SET firstName = ?, lastName = ?, email = ?
         WHERE accId = ? AND roleID = 1 AND isDeleted = 0`,
        [firstName, lastName, email, ownerId]
      );

      // 2. Update clientinfo_tbl
      await connection.execute(
        `UPDATE clientinfo_tbl 
         SET gender = ?, dateOfBirth = ?, address = ?, contactNo = ?
         WHERE accId = ?`,
        [sex || null, dob || null, address || null, phone, ownerId]
      );

      await connection.commit();
      connection.release();

      res.status(200).json({ message: "Owner updated successfully" });

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (err) {
    console.error("Error updating owner:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};