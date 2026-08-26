const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Remedy = require("../models/Remedy");
const initialRemedies = require("../config/initialRemedies.json");

// Ensure local directory exists for image storage
const uploadDir = "E:/Mongodb_Siddheswari/Remedies";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".png";
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET /api/remedies - Fetch all remedies from remedies collection (no auto-seeding)
router.get("/", async (req, res) => {
  try {
    const remedies = await Remedy.find().sort({ remedyId: 1, id: 1, _id: 1 });
    res.json(remedies);
  } catch (err) {
    console.error("Error fetching remedies:", err);
    res.status(500).json({ message: "Failed to fetch remedies", error: err.message });
  }
});

// DELETE /api/remedies - Clear all remedies from database collection
router.delete("/", async (req, res) => {
  try {
    const result = await Remedy.deleteMany({});
    res.json({ message: "All remedies deleted from database", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear remedies", error: err.message });
  }
});

// POST /api/remedies/seed - Force re-seed database collection
router.post("/seed", async (req, res) => {
  try {
    await Remedy.deleteMany({});
    const inserted = await Remedy.insertMany(initialRemedies);
    res.json({ message: `Successfully seeded ${inserted.length} remedies!`, remedies: inserted });
  } catch (err) {
    res.status(500).json({ message: "Failed to seed remedies", error: err.message });
  }
});

// POST /api/remedies - Create a new remedy with optional file upload
router.post("/", upload.single("imageFile"), async (req, res) => {
  try {
    const {
      name,
      remedyName,
      category,
      mrp,
      price,
      tag,
      badge,
      description,
      weight,
      packagingWeight,
      dosage,
      recommendedDosage,
      keyIngredients,
      benefits,
      primaryBenefits,
      certification,
      expiry
    } = req.body;

    const finalName = (remedyName || name || "").trim();
    if (!finalName) {
      return res.status(400).json({ message: "Remedy name is required" });
    }

    // Determine Image Path
    let imagePath = "";
    if (req.file) {
      imagePath = `/remedies-images/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    } else {
      imagePath = "/images/placeholder.png";
    }

    // Determine Next ID
    const lastRemedy = await Remedy.findOne().sort({ remedyId: -1, id: -1 });
    const nextId = lastRemedy ? (lastRemedy.remedyId || lastRemedy.id || 0) + 1 : 1;

    const parsedMRP = Number(mrp || price || 0);
    const formattedPrice = price ? (String(price).startsWith("₹") ? price : `₹${price}`) : `₹${parsedMRP}`;

    const newRemedy = new Remedy({
      remedyId: nextId,
      id: nextId,
      name: finalName,
      category: category || "Others",
      price: formattedPrice,
      mrp: parsedMRP,
      rating: 5.0,
      reviews: 1,
      image: imagePath,
      tag: tag || "",
      badge: badge || "",
      description: description || "",
      specifications: {
        weight: weight || packagingWeight || "",
        dosage: dosage || recommendedDosage || "",
        keyIngredients: keyIngredients || "",
        benefits: benefits || primaryBenefits || "",
        certification: certification || "Ayush Certified",
        expiry: expiry || "24 Months from MFD"
      }
    });

    await newRemedy.save();

    res.status(201).json({
      message: "Remedy created successfully!",
      remedy: newRemedy
    });
  } catch (err) {
    console.error("Error creating remedy:", err);
    res.status(500).json({ message: "Failed to save remedy", error: err.message });
  }
});

// DELETE /api/remedies/:id - Delete a remedy by ID or _id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let deleted;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await Remedy.findByIdAndDelete(id);
    } else {
      deleted = await Remedy.findOneAndDelete({ $or: [{ remedyId: Number(id) }, { id: Number(id) }] });
    }

    if (!deleted) {
      return res.status(404).json({ message: "Remedy not found" });
    }

    res.json({ message: "Remedy deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete remedy", error: err.message });
  }
});

module.exports = router;
