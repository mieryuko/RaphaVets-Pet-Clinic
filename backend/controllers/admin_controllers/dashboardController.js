import db from "../../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get the logged-in admin's ID from the token (set by authMiddleware)
    const adminId = req.user.id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the logged-in admin's name
    const [adminRows] = await db.query(`
      SELECT firstName, lastName 
      FROM account_tbl 
      WHERE accId = ? AND roleID = 2 AND isDeleted = 0
    `, [adminId]);

    if (adminRows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get total pet owners (all client users who are not deleted)
    const [ownerRows] = await db.query(`
      SELECT COUNT(*) as totalOwners 
      FROM account_tbl 
      WHERE roleID = 1 AND isDeleted = 0
    `);

    // Get total pets - only from non-deleted owners
    const [petRows] = await db.query(`
      SELECT COUNT(*) as totalPets 
      FROM pet_tbl p
      INNER JOIN account_tbl a ON p.accID = a.accId
      WHERE p.isDeleted = 0 AND a.isDeleted = 0 AND a.roleID = 1
    `);

    const adminName = `${adminRows[0].firstName} ${adminRows[0].lastName}`;

    const stats = {
      adminName,
      totalOwners: ownerRows[0]?.totalOwners || 0,
      totalPets: petRows[0]?.totalPets || 0,
    };

    res.json(stats);
  } catch (err) {
    console.error("❌ Failed to fetch dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};