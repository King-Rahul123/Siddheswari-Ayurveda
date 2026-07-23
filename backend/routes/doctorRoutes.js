const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { getNextSequence } = require("../models/Counter");

// Generate Next Doctor Code
router.get("/next-code", async (req, res) => {
  try {
    const nextId = await getNextSequence("doctor");
    const code = `DR${nextId.toString().padStart(4, "0")}`;
    res.json({ code, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Doctor
router.post("/", async (req, res) => {
  try {
    const doctorData = req.body;
    let doctorCode = doctorData.doctorCode;
    if (!doctorCode) {
      const nextId = await getNextSequence("doctor");
      doctorCode = `DR${nextId.toString().padStart(4, "0")}`;
    }

    const doctor = new Doctor({
      ...doctorData,
      doctorCode
    });

    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
