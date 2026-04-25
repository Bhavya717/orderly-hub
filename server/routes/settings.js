const router = require("express").Router();
const Settings = require("../models/Settings");
const auth = require("../middleware/auth");

// GET /api/settings/qr  — public
router.get("/qr", async (req, res) => {
  try {
    const s = await Settings.findOne({ key: "qr" });
    res.json({ value: s ? s.value : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/qr  — admin
router.put("/qr", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin only" });
    const { value } = req.body;
    const s = await Settings.findOneAndUpdate(
      { key: "qr" },
      { value },
      { upsert: true, new: true }
    );
    res.json({ value: s.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
