const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const { getNextSequence } = require("../models/Counter");

// Generate Next Patient Code
router.get("/next-code", async (req, res) => {
  try {
    const nextId = await getNextSequence("patient");
    const code = `P${nextId.toString().padStart(4, "0")}`;
    res.json({ code, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Patient
router.post("/", async (req, res) => {
  try {
    const patientData = req.body;
    let patientCode = patientData.patientCode;
    if (!patientCode) {
      const nextId = await getNextSequence("patient");
      patientCode = `P${nextId.toString().padStart(4, "0")}`;
    }

    const patient = new Patient({
      ...patientData,
      patientCode
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Patient
router.put("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const patient = await Patient.findOneAndUpdate(
      { patientCode: code },
      req.body,
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
