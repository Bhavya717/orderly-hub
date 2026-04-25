const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentScreenshot: { type: String, default: "" }, // base64
  status: { type: String, enum: ["processing", "completed"], default: "processing" },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model("Order", orderSchema);
