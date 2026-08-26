const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Staff = require("./models/Staff");

const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Seed initial admin user if empty
const seedAdmin = async () => {
  try {
    const adminCount = await Staff.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const defaultAdmin = new Staff({
        username: "admin",
        name: "Administrator",
        email: "admin@siddheswari.com",
        phone: "9876543210",
        password: hashedPassword,
        role: "admin",
        salary: "50000",
        address: "Head Office"
      });
      await defaultAdmin.save();
      console.log("Default admin account created: admin / admin");
    }
  } catch (err) {
    console.error("Error seeding admin:", err.message);
  }
};

seedAdmin();

// Serve static uploaded remedies images
const path = require("path");
const fs = require("fs");
const remediesUploadCandidates = [
  process.env.REMEDIES_UPLOAD_DIR,
  "E:/Mongodb_Siddheswari/Remedies",
  "D:/Mongodb_Siddheswari/Remedies",
  path.join(__dirname, "uploads", "remedies"),
].filter(Boolean);

const resolveRemediesUploadDir = () => {
  for (const dir of remediesUploadCandidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    } catch (err) {
      console.warn(`Unable to use remedies static dir: ${dir}`, err.message);
    }
  }
  throw new Error("No valid remedies static directory is available");
};

const remediesUploadDir = resolveRemediesUploadDir();
console.log("Remedies upload directory:", remediesUploadDir);
app.use("/remedies-images", express.static(remediesUploadDir));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/sales", require("./routes/saleRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/remedies", require("./routes/remedyRoutes"));

app.get("/", (req, res) => {
  res.send("Siddheswari Ayurveda Node.js + Express Server Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend Express server listening on http://localhost:${PORT}`);
});
