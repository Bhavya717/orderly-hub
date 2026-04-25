const mongoose = require("mongoose");

// Simple key-value store for app settings (e.g., QR code)
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: "" },
});

module.exports = mongoose.model("Settings", settingsSchema);
