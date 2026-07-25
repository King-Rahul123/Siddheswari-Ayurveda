const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");
const authMiddleware = require("../middleware/authMiddleware");

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(404).json({ message: "Username not found" });
    }

    let isMatch = await bcrypt.compare(password, staff.password);

    // Fallback for legacy plain-text passwords
    if (!isMatch && staff.password === password) {
      isMatch = true;
      staff.password = await bcrypt.hash(password, 10);
      await staff.save();
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: staff._id, username: staff.username, role: staff.role },
      process.env.JWT_SECRET || "siddheswari_ayurveda_jwt_secret_key_2026_secure",
      { expiresIn: "1d" }
    );

    const userData = staff.toObject();
    delete userData.password;

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password (protected)
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(404).json({ message: "User not found" });
    }

    let isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch && staff.password === currentPassword) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    staff.password = await bcrypt.hash(newPassword, 10);
    await staff.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all staff (protected)
router.get("/staff", authMiddleware, async (req, res) => {
  try {
    const staffList = await Staff.find().select("-password").sort({ createdAt: -1 });
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add staff (protected)
router.post("/staff", authMiddleware, async (req, res) => {
  try {
    const { username, name, email, phone, password, role, salary, address } = req.body;
    const existing = await Staff.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const staff = new Staff({
      username,
      name: (name || "").trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      password: hashedPassword,
      role: role || "staff",
      salary: salary || "",
      address: address || ""
    });

    await staff.save();
    const createdStaff = staff.toObject();
    delete createdStaff.password;
    res.status(201).json(createdStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update staff (protected)
router.put("/staff/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const staff = await Staff.findOne({ username });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const updates = req.body;
    if (updates.name !== undefined) staff.name = updates.name.trim();
    if (updates.email !== undefined) staff.email = updates.email.trim();
    if (updates.phone !== undefined) staff.phone = updates.phone.trim();
    if (updates.role !== undefined) staff.role = updates.role;
    if (updates.salary !== undefined) staff.salary = updates.salary;
    if (updates.address !== undefined) staff.address = updates.address;
    if (updates.password && updates.password.trim() !== "") {
      staff.password = await bcrypt.hash(updates.password.trim(), 10);
    }

    await staff.save();
    const updatedStaff = staff.toObject();
    delete updatedStaff.password;
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete staff (protected)
router.delete("/staff/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    await Staff.findOneAndDelete({ username });
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
