const express = require("express");
const router = express.Router();
const http = require("http");

// Proxy route to Python FastAPI service running on port 8000
router.get("/overview", (req, res) => {
  const fastApiUrl = process.env.FASTAPI_ANALYTICS_URL || "http://127.0.0.1:8000";

  http
    .get(`${fastApiUrl}/api/analytics/overview`, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => {
        data += chunk;
      });
      apiRes.on("end", () => {
        try {
          const json = JSON.parse(data);
          res.json(json);
        } catch (e) {
          res.status(500).json({ message: "Invalid JSON from Analytics Service" });
        }
      });
    })
    .on("error", (err) => {
      res.status(502).json({
        message: "Failed to connect to Python FastAPI Analytics service",
        error: err.message
      });
    });
});

module.exports = router;
