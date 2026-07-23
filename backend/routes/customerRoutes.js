const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { getNextSequence } = require("../models/Counter");

// Generate Next Customer Code
router.get("/next-code", async (req, res) => {
  try {
    const nextId = await getNextSequence("customer");
    const code = `CUS${nextId.toString().padStart(4, "0")}`;
    res.json({ code, nextId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check Customer Phone
router.get("/check-phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ phone });
    if (customer) {
      return res.json(customer);
    }
    return res.json(null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all Customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Customer
router.post("/", async (req, res) => {
  try {
    const customerData = req.body;
    let customerCode = customerData.customerCode;
    if (!customerCode) {
      const nextId = await getNextSequence("customer");
      customerCode = `CUS${nextId.toString().padStart(4, "0")}`;
    }

    const customer = new Customer({
      ...customerData,
      customerCode
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Customer
router.put("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const customer = await Customer.findOneAndUpdate(
      { customerCode: code },
      req.body,
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Customer
router.delete("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    await Customer.findOneAndDelete({ customerCode: code });
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
