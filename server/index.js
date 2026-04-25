const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:8080"], 
  credentials: true 
}));
app.use(express.json({ limit: "10mb" })); // large for base64 images

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/settings", require("./routes/settings"));

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Connect to MongoDB then start server
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    // Seed default data if empty
    await require("./seed")();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
