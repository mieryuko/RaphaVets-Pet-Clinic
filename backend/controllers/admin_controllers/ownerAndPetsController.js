  import db from "../../config/db.js";
  import bcrypt from 'bcryptjs';
  import nodemailer from 'nodemailer';

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

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
      pets
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, phone" });
    }

    // ✅ ADDED: Check if email already exists
    const [existingEmail] = await db.execute(
      "SELECT accId FROM account_tbl WHERE email = ? AND isDeleted = 0",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate random password
    const generateRandomPassword = (length = 12) => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*';
      
      const allChars = uppercase + lowercase + numbers + symbols;
      
      let password = '';
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];
      
      for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
      
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create account WITH PASSWORD
      const [accountResult] = await connection.execute(
        `INSERT INTO account_tbl 
         (firstName, lastName, email, password, roleID, isDeleted, createdAt) 
         VALUES (?, ?, ?, ?, 1, 0, NOW())`,
        [firstName, lastName, email, hashedPassword]
      );

      const accId = accountResult.insertId;

      // Create client info
      await connection.execute(
        `INSERT INTO clientinfo_tbl 
         (accId, gender, dateOfBirth, address, contactNo) 
         VALUES (?, ?, ?, ?, ?)`,
        [accId, sex || null, dob || null, address || null, phone]
      );

      // Create pets if provided
      if (pets && pets.length > 0) {
        for (const pet of pets) {
          if (pet.name && pet.type && pet.breed) {
            const [breedRow] = await connection.execute(
              "SELECT breedID FROM breed_tbl WHERE breedName = ? LIMIT 1",
              [pet.breed]
            );

            if (breedRow.length === 0) {
              await connection.rollback();
              return res.status(400).json({ message: `Invalid breed: ${pet.breed}` });
            }

            const breedID = breedRow[0].breedID;

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

      await connection.commit();
      connection.release();

      // Send email with login credentials
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || '"RaphaVets Clinic" <markmapili29@gmail.com>',
          to: email,
          subject: 'Your RaphaVets Clinic Account Login Credentials',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to RaphaVets Clinic!</h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-bottom: 15px;">Your Account Has Been Created</h3>
                
                <p style="color: #475569; margin-bottom: 10px;">
                  Hello ${firstName} ${lastName},
                </p>
                
                <p style="color: #475569; margin-bottom: 15px;">
                  Your account has been successfully created. Here are your login credentials:
                </p>
                
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${plainPassword}</code></p>
                </div>
                
                <p style="color: #475569; margin-top: 15px; font-size: 14px;">
                  <strong>Important:</strong> Please change your password after your first login for security.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="${process.env.CLINIC_URL || 'http://localhost:3000'}" 
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; text-align: center;">
                  This is an automated message. Please do not reply to this email.<br>
                  If you have any questions, please contact our clinic directly.
                </p>
              </div>
            </div>
          `
        });
        
        console.log(`✅ Login credentials email sent to ${email}`);
        
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Don't fail the whole request if email fails
      }

      res.status(201).json({ 
        message: "Owner and pets created successfully",
        accId: accId,
        password: plainPassword,
        email: email
      });

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (err) {
    console.error("Error creating owner:", err);
    
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

      res.status(200).json({ 
        message: "Owner updated successfully",
        // NO password or email sending for edits
      });

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

export const softDeleteOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const [result] = await db.execute(
      'UPDATE account_tbl SET isDeleted = 1 WHERE accId = ? AND roleID = 1',
      [ownerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    res.status(200).json({ message: 'Owner soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting owner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const softDeletePet = async (req, res) => {
  try {
    const { petId } = req.params;

    const [result] = await db.execute(
      'UPDATE pet_tbl SET isDeleted = 1 WHERE petID = ?',
      [petId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json({ message: 'Pet soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting pet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const softDeleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const [result] = await db.execute(
      'UPDATE records SET isDeleted = 1 WHERE recordId = ?',
      [recordId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json({ message: 'Record soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};