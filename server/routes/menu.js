const router = require("express").Router();
const MenuItem = require("../models/MenuItem");
const auth = require("../middleware/auth");

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// GET /api/menu  — public
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items.map((m) => ({ id: m._id.toString(), name: m.name, description: m.description, price: m.price, category: m.category, image: m.image })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/menu  — admin
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    if (!name || price === undefined)
      return res.status(400).json({ error: "name and price are required" });
    const item = await MenuItem.create({ name, description, price, category, image });
    res.status(201).json({ id: item._id.toString(), name: item.name, description: item.description, price: item.price, category: item.category, image: item.image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/menu/:id  — admin
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, image },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ id: item._id.toString(), name: item.name, description: item.description, price: item.price, category: item.category, image: item.image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/menu/:id  — admin
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
