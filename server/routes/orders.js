const router = require("express").Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");

// GET /api/orders
// Admin → all orders; Customer → own orders
router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders  — customer creates an order
router.post("/", auth, async (req, res) => {
  try {
    const { customerName, phone, items, totalAmount, paymentScreenshot } = req.body;
    if (!phone || !items || !totalAmount)
      return res.status(400).json({ error: "Missing required fields" });

    const tokenId = "T" + Math.floor(1000 + Math.random() * 9000);
    const order = await Order.create({
      tokenId,
      userId: req.user.id,
      customerName: customerName || req.user.name,
      phone,
      items,
      totalAmount,
      paymentScreenshot: paymentScreenshot || "",
      status: "processing",
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:tokenId  — admin updates status
router.patch("/:tokenId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin only" });
    const order = await Order.findOneAndUpdate(
      { tokenId: req.params.tokenId },
      { $set: req.body },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:tokenId  — admin or order owner
router.delete("/:tokenId", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ tokenId: req.params.tokenId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (req.user.role !== "admin" && order.userId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    await order.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
