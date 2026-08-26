const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Remedy = require("../models/Remedy");
const initialRemedies = require("../config/initialRemedies.json");

const candidateUploadDirs = [
  process.env.REMEDIES_UPLOAD_DIR,
  "E:/Mongodb_Siddheswari/Remedies",
  "D:/Mongodb_Siddheswari/Remedies",
  path.join(__dirname, "..", "uploads", "remedies"),
].filter(Boolean);

const resolveUploadDir = () => {
  for (const dir of candidateUploadDirs) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    } catch (err) {
      console.warn(`Unable to use upload dir: ${dir}`, err.message);
    }
  }
  throw new Error("No valid remedies upload directory is available");
};

const uploadDir = resolveUploadDir();

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

// Ensure multer errors are returned as JSON instead of HTML.
const uploadRemedyImage = (req, res, next) => {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    return res.status(500).json({
      message: "Remedies image folder is not accessible",
      error: err.message,
    });
  }

  upload.single("imageFile")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image size must be less than 10MB" });
      }
      return res.status(400).json({ message: "Image upload failed", error: err.message });
    }

    return res.status(500).json({
      message: "Failed to save image file. Check remedies folder permissions/path.",
      error: err.message,
    });
  });
};

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
router.post("/", uploadRemedyImage, async (req, res) => {
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
