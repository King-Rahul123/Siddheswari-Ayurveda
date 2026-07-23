const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const { getNextSequence } = require("../models/Counter");

// Generate Next Company Code
router.get("/next-code", async (req, res) => {
  try {
    const nextId = await getNextSequence("companies");
    const code = `DR${nextId.toString().padStart(4, "0")}`;
    res.json({ code, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Companies
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Company
router.post("/", async (req, res) => {
  try {
    const companyData = req.body;
    let companiesCode = companyData.companiesCode;
    if (!companiesCode) {
      const nextId = await getNextSequence("companies");
      companiesCode = `DR${nextId.toString().padStart(4, "0")}`;
    }

    const company = new Company({
      ...companyData,
      companiesCode
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
