const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: "" },
  image: { type: String, default: "" }, // emoji or URL
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
