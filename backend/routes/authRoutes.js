const express = require("express");
const router = express.Router();
const Staff = require("../models/Staff");

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(404).json({ message: "Username not found" });
    }

    if (staff.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const userData = staff.toObject();
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.post("/change-password", async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(404).json({ message: "User not found" });
    }

    if (staff.password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    staff.password = newPassword;
    await staff.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all staff
router.get("/staff", async (req, res) => {
  try {
    const staffList = await Staff.find().sort({ createdAt: -1 });
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add staff
router.post("/staff", async (req, res) => {
  try {
    const { username, name, email, phone, password, role, salary, address } = req.body;
    const existing = await Staff.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const staff = new Staff({
      username,
      name: (name || "").trim(),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      password,
      role: role || "staff",
      salary: salary || "",
      address: address || ""
    });

    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update staff
router.put("/staff/:username", async (req, res) => {
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

    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete staff
router.delete("/staff/:username", async (req, res) => {
  try {
    const { username } = req.params;
    await Staff.findOneAndDelete({ username });
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
