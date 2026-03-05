// Add this to your vet controller
// POST /vet/change-password
export const changeVetPassword = async (req, res) => {
  try {
    const vetId = req.user.id; // From auth middleware
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "New password and confirm password do not match" 
      });
    }

    // Password strength validation (matching your frontend requirements)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[*\-@\$]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must meet requirements" 
      });
    }

    // Find vet/user
    const vet = await Vet.findById(vetId); // or User model
    if (!vet) {
      return res.status(404).json({ message: "Vet not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, vet.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    vet.password = hashedPassword;
    await vet.save();

    res.json({ 
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ 
      message: "Server error while changing password" 
    });
  }
};