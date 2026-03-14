  import db from "../../config/db.js";
  import bcrypt from 'bcryptjs';
  import { getIO } from "../../socket.js";
  import { getDefaultFromAddress, isResendConfigured, sendResendEmail } from "../../utils/resendEmail.js";
  import { removeNotificationsByReference } from "../notificationController.js";
const NAME_REGEX = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeToLocalPhone = (rawValue) => {
  const digits = String(rawValue || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("63")) return digits.slice(2);
  return null;
};

  export const getOwnersWithPets = async (req, res) => {
  try {
    // fetch all owners (roleID = 1)
    const [owners] = await db.execute(`
      SELECT 
        a.accId,
        CONCAT(a.firstName, ' ', a.lastName) AS name,
        a.firstName,
        a.lastName,
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

    // Group pets by owner once to avoid O(owners * pets) filtering.
    const petsByOwner = pets.reduce((acc, pet) => {
      const ownerId = pet.accID;
      if (!acc.has(ownerId)) acc.set(ownerId, []);
      acc.get(ownerId).push(pet);
      return acc;
    }, new Map());

    const results = owners.map((owner) => ({
      ...owner,
      pets: petsByOwner.get(owner.accId) || [],
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
      let query = "SELECT breedName FROM breed_tbl";
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

      const missing = [];
      if (!ownerId) missing.push("ownerId");
      if (!type) missing.push("type");
      if (!breed) missing.push("breed");
      if (!name) missing.push("name");
      if (!sex) missing.push("sex");
      if (!weight) missing.push("weight");
      if (!dob) missing.push("dob");

      if (missing.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missing.join(", ")}`,
          missingFields: missing,
        });
      }

      const parsedDob = new Date(dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(parsedDob.getTime()) || parsedDob > today) {
        return res.status(400).json({ message: "Date of birth cannot be in the future" });
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
      const [result] = await db.execute(
        `INSERT INTO pet_tbl 
          (accID, breedID, petName, petGender, weight_kg, color, dateOfBirth, note, imageName, isDeleted) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ownerId,
          breedID,
          name,
          sex || null,
          weight || null,
          color || null,
          dob || null,
          notes || null,
          '',
          0
        ]
      );

      const petData = req.body;


      try {
        const io = getIO();
        io.emit("pet_created", {
          petId: result.insertId,
          ownerId: Number(ownerId),
          petName: name,
        });
        io.emit("pets_updated", {
          action: "pet_created",
          ownerId: Number(ownerId),
          petId: result.insertId,
        });
        io.to(`user_${Number(ownerId)}`).emit("pets_updated", {
          action: "pet_created",
          ownerId: Number(ownerId),
          petId: result.insertId,
        });
      } catch (socketError) {
        console.error("⚠️ Socket emit failed (createPet):", socketError.message);
      }

      res.status(201).json({ message: "Pet created successfully", petId: result.insertId });

    } catch (err) {

      console.error("Error creating pet:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  export const updatePet = async (req, res) => {
    try {
      const { petId } = req.params;
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
      pets
    } = req.body;

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    const normalizedEmail = String(email || "").trim();
    const normalizedAddress = address ? String(address).trim() : null;
    const normalizedPhone = normalizeToLocalPhone(phone);

    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !normalizedPhone) {
      return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, phone" });
    }

    if (!NAME_REGEX.test(normalizedFirstName) || !NAME_REGEX.test(normalizedLastName)) {
      return res.status(400).json({ message: "Names must contain only letters, spaces, hyphens, and apostrophes" });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Check if email exists and whether we can reuse a deleted account.
    const [existingAccount] = await db.execute(
      "SELECT accId, roleID, isDeleted FROM account_tbl WHERE email = ?",
      [normalizedEmail]
    );

    if (existingAccount.length > 0) {
      const account = existingAccount[0];
      
      // If account exists and is NOT deleted, reject
      if (account.isDeleted === 0) {
        return res.status(409).json({ message: "Email is already in use." });
      }

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
      let accId;
      const insertedPetIds = [];

      // Check if there's a deleted account we want to "reactivate"
      const [deletedAccount] = await connection.execute(
        "SELECT accId FROM account_tbl WHERE email = ? AND isDeleted = 1",
        [normalizedEmail]
      );

      if (deletedAccount.length > 0) {
        // Reactivate the deleted account
        const oldAccId = deletedAccount[0].accId;

        // Clear stale role-bound/account-bound rows before repurposing this account as a client.
        await connection.execute("DELETE FROM admin_info_tbl WHERE accID = ?", [oldAccId]);
        await connection.execute("DELETE FROM vet_table WHERE accId = ?", [oldAccId]);
        await connection.execute("DELETE FROM user_websocket_sessions_tbl WHERE accID = ?", [oldAccId]);
        await connection.execute("DELETE FROM user_notifications_tbl WHERE accID = ?", [oldAccId]);
        await connection.execute("DELETE FROM userpreference_tbl WHERE accId = ?", [oldAccId]);
        await connection.execute("DELETE FROM clientinfo_tbl WHERE accId = ?", [oldAccId]);
        
        await connection.execute(
          `UPDATE account_tbl 
           SET roleID = 1, firstName = ?, lastName = ?, password = ?, isDeleted = 0, 
               lastUpdatedAt = NOW(), createdAt = NOW()
           WHERE accId = ?`,
          [normalizedFirstName, normalizedLastName, hashedPassword, oldAccId]
        );
        
        accId = oldAccId;
        
        await connection.execute(
          `INSERT INTO clientinfo_tbl 
           (accId, gender, dateOfBirth, address, contactNo) 
           VALUES (?, ?, ?, ?, ?)`,
          [oldAccId, sex || null, dob || null, normalizedAddress, normalizedPhone]
        );
        
        
      } else {
        // Create new account
        const [accountResult] = await connection.execute(
          `INSERT INTO account_tbl 
           (firstName, lastName, email, password, roleID, isDeleted, createdAt) 
           VALUES (?, ?, ?, ?, 1, 0, NOW())`,
          [normalizedFirstName, normalizedLastName, normalizedEmail, hashedPassword]
        );

        accId = accountResult.insertId;

        // Create client info
        await connection.execute(
          `INSERT INTO clientinfo_tbl 
           (accId, gender, dateOfBirth, address, contactNo) 
           VALUES (?, ?, ?, ?, ?)`,
          [accId, sex || null, dob || null, normalizedAddress, normalizedPhone]
        );
      }

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

            const [insertedPet] = await connection.execute(
              `INSERT INTO pet_tbl 
               (accID, breedID, petName, petGender, weight_kg, color, dateOfBirth, note, imageName, isDeleted) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                accId,
                breedID,
                pet.name,
                pet.sex || null,
                pet.weight || null,
                pet.color || null,
                pet.dob || null,
                pet.notes || null,
                '',
                0
              ]
            );

            insertedPetIds.push(insertedPet.insertId);
          }
        }
      }

      await connection.commit();
      connection.release();

      try {
        const io = getIO();
        io.emit("owner_created", {
          ownerId: Number(accId),
          email: normalizedEmail,
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
        });

        io.emit("pets_updated", {
          action: "owner_created",
          ownerId: Number(accId),
          petIds: insertedPetIds.map(Number),
        });

        io.to(`user_${Number(accId)}`).emit("pets_updated", {
          action: "owner_created",
          ownerId: Number(accId),
          petIds: insertedPetIds.map(Number),
        });
      } catch (socketError) {
        console.error("⚠️ Socket emit failed (createOwner):", socketError.message);
      }

      res.status(201).json({ 
        message: "Owner and pets created successfully",
        accId: accId,
        password: plainPassword,
        email: normalizedEmail
      });

      // Send email in background to avoid blocking API response
      setImmediate(async () => {
        try {
          if (!isResendConfigured()) {
            console.warn('⚠️ Resend not configured for owner credentials email', {
              hasApiKey: Boolean(process.env.RESEND_API_KEY),
              hasFrom: Boolean(process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL),
            });
            return;
          }

          const info = await sendResendEmail({
            from: getDefaultFromAddress(),
            to: normalizedEmail,
            subject: 'Your RaphaVets Clinic Account Login Credentials',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; text-align: center;">Welcome to RaphaVets Clinic!</h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e293b; margin-bottom: 15px;">Your Account Has Been Created</h3>
                  
                  <p style="color: #475569; margin-bottom: 10px;">
                    Hello ${normalizedFirstName} ${normalizedLastName},
                  </p>
                  
                  <p style="color: #475569; margin-bottom: 15px;">
                    Your account has been successfully created. Here are your login credentials:
                  </p>
                  
                  <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${normalizedEmail}</p>
                    <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${plainPassword}</code></p>
                  </div>
                  
                  <p style="color: #475569; margin-top: 15px; font-size: 14px;">
                    <strong>Important:</strong> Please change your password after your first login for security.
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                  <a href="${process.env.CLINIC_URL || process.env.FRONTEND_URL || '#'}" 
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
        } catch (emailError) {
          console.error('❌ Failed to send email:', emailError);
        }
      });

    } catch (transactionError) {
      await connection.rollback();
      connection.release();
      throw transactionError;
    }

  } catch (err) {
    console.error("Error creating owner:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Email is already in use." });
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

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    const normalizedEmail = String(email || "").trim();
    const normalizedAddress = address ? String(address).trim() : null;
    const normalizedPhone = normalizeToLocalPhone(phone);

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !normalizedPhone) {
      return res.status(400).json({ message: "First name, last name, email, and phone are required" });
    }

    if (!NAME_REGEX.test(normalizedFirstName) || !NAME_REGEX.test(normalizedLastName)) {
      return res.status(400).json({ message: "Names must contain only letters, spaces, hyphens, and apostrophes" });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const [duplicateEmailRows] = await db.execute(
      `SELECT accId
       FROM account_tbl
       WHERE email = ? AND accId <> ? AND isDeleted = 0
       LIMIT 1`,
      [normalizedEmail, ownerId]
    );

    if (duplicateEmailRows.length > 0) {
      return res.status(409).json({ message: "Email is already in use." });
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
        [normalizedFirstName, normalizedLastName, normalizedEmail, ownerId]
      );

      // 2. Update clientinfo_tbl
      await connection.execute(
        `UPDATE clientinfo_tbl 
         SET gender = ?, dateOfBirth = ?, address = ?, contactNo = ?
         WHERE accId = ?`,
        [sex || null, dob || null, normalizedAddress, normalizedPhone, ownerId]
      );

      await connection.commit();
      connection.release();

      try {
        const io = getIO();
        const payload = {
          accId: Number(ownerId),
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          email: normalizedEmail,
          phone: normalizedPhone,
          address: normalizedAddress,
          sex,
          dob
        };

        io.emit("owner_updated", payload);
        io.to(`user_${ownerId}`).emit("owner_profile_updated", payload);
      } catch (socketError) {
        console.error("⚠️ Socket emit failed (updateOwner):", socketError.message);
      }

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
  let connection;
  try {
    const { ownerId } = req.params;
    const numericOwnerId = Number(ownerId);
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'UPDATE account_tbl SET isDeleted = 1, lastUpdatedAt = NOW() WHERE accId = ? AND roleID = 1',
      [ownerId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Delete client-linked data for deleted clients.
    const [petRows] = await connection.execute(
      'SELECT petID FROM pet_tbl WHERE accID = ?',
      [ownerId]
    );
    const petIds = petRows.map((pet) => pet.petID).filter(Boolean);

    const [appointmentRows] = await connection.execute(
      'SELECT appointmentID FROM appointment_tbl WHERE accID = ?',
      [ownerId]
    );
    const appointmentIds = appointmentRows.map((row) => row.appointmentID).filter(Boolean);

    const [forumRows] = await connection.execute(
      'SELECT forumID FROM forum_posts_tbl WHERE accID = ?',
      [ownerId]
    );
    const forumIds = forumRows.map((row) => row.forumID).filter(Boolean);

    if (petIds.length > 0) {
      const placeholders = petIds.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM petmedical_file_tbl WHERE petmedicalID IN (
          SELECT petMedicalID FROM petmedical_tbl WHERE petID IN (${placeholders})
        )`,
        petIds
      );
      await connection.execute(
        `DELETE FROM petmedical_tbl WHERE petID IN (${placeholders})`,
        petIds
      );
    }

    // Hide forum posts and images from deleted owners.
    await connection.execute(
      'UPDATE forum_posts_tbl SET isDeleted = 1 WHERE accID = ?',
      [ownerId]
    );
    await connection.execute(
      `UPDATE forum_images_tbl fi
       JOIN forum_posts_tbl fp ON fp.forumID = fi.forumID
       SET fi.isDeleted = 1
       WHERE fp.accID = ?`,
      [ownerId]
    );

    await connection.execute('DELETE FROM appointment_tbl WHERE accID = ?', [ownerId]);
    await connection.execute('DELETE FROM pet_tbl WHERE accID = ?', [ownerId]);
    await connection.execute('DELETE FROM clientinfo_tbl WHERE accId = ?', [ownerId]);
    await connection.execute('DELETE FROM userpreference_tbl WHERE accId = ?', [ownerId]);
    await connection.execute('DELETE FROM feedbacks_tbl WHERE accID = ?', [ownerId]);

    await connection.commit();
    connection.release();

    // Best-effort cleanup of related notifications.
    try {
      for (const petId of petIds) {
        await removeNotificationsByReference('pet_tbl', Number(petId));
      }

      for (const appointmentId of appointmentIds) {
        await removeNotificationsByReference('appointment_tbl', Number(appointmentId));
      }

      for (const forumId of forumIds) {
        await removeNotificationsByReference('forum_posts_tbl', Number(forumId));
      }
    } catch (notifError) {
      console.error('⚠️ Notification cleanup after owner deletion failed:', notifError.message);
    }

    try {
      const io = getIO();
      io.emit('owner_deleted', { ownerId: numericOwnerId });
      io.to(`user_${numericOwnerId}`).emit('account_deleted', { ownerId: numericOwnerId });
      io.to(`user_${numericOwnerId}`).emit('pets_updated', {
        action: 'owner_deleted',
        ownerId: numericOwnerId,
        petIds: petIds.map(Number),
      });
    } catch (socketError) {
      console.error('⚠️ Socket emit failed (softDeleteOwner):', socketError.message);
    }

    res.status(200).json({ message: 'Owner soft deleted successfully' });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed in softDeleteOwner:', rollbackError);
      }
      connection.release();
    }
    console.error('Error soft deleting owner:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const softDeletePet = async (req, res) => {
  let connection;
  try {
    const { petId } = req.params;
    const numericPetId = Number(petId);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [petRows] = await connection.execute(
      'SELECT accID FROM pet_tbl WHERE petID = ? AND isDeleted = 0',
      [petId]
    );

    if (!petRows.length) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Pet not found' });
    }

    const ownerId = Number(petRows[0].accID);

    const [appointmentRows] = await connection.execute(
      'SELECT appointmentID FROM appointment_tbl WHERE petID = ?',
      [petId]
    );
    const appointmentIds = appointmentRows.map((row) => row.appointmentID).filter(Boolean);

    const [medicalRows] = await connection.execute(
      'SELECT petMedicalID FROM petmedical_tbl WHERE petID = ?',
      [petId]
    );
    const medicalIds = medicalRows.map((row) => row.petMedicalID).filter(Boolean);

    const [result] = await connection.execute(
      'UPDATE pet_tbl SET isDeleted = 1 WHERE petID = ?',
      [petId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (medicalIds.length > 0) {
      const placeholders = medicalIds.map(() => '?').join(',');
      await connection.execute(
        `DELETE FROM petmedical_file_tbl WHERE petmedicalID IN (${placeholders})`,
        medicalIds
      );
      await connection.execute(
        `DELETE FROM petmedical_tbl WHERE petMedicalID IN (${placeholders})`,
        medicalIds
      );
    }

    await connection.execute('DELETE FROM appointment_tbl WHERE petID = ?', [petId]);

    await connection.commit();
    connection.release();

    try {
      await removeNotificationsByReference('pet_tbl', numericPetId);

      for (const appointmentId of appointmentIds) {
        await removeNotificationsByReference('appointment_tbl', Number(appointmentId));
      }

      for (const medicalId of medicalIds) {
        await removeNotificationsByReference('petmedical_tbl', Number(medicalId));
      }
    } catch (notifError) {
      console.error('⚠️ Failed to cleanup pet notifications:', notifError.message);
    }

    try {
      const io = getIO();
      io.to(`user_${ownerId}`).emit('pets_updated', {
        action: 'pet_deleted',
        ownerId,
        petId: numericPetId,
      });
      io.emit('pet_deleted', { ownerId, petId: numericPetId });
    } catch (socketError) {
      console.error('⚠️ Socket emit failed (softDeletePet):', socketError.message);
    }

    res.status(200).json({ message: 'Pet soft deleted successfully' });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed in softDeletePet:', rollbackError);
      }
      connection.release();
    }
    console.error('Error soft deleting pet:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
