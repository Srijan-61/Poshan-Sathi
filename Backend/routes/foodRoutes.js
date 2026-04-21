const express = require("express");
const router = express.Router();
const {
  getFoods,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  getSmartRecommendations,
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

router.get("/recommendations", protect, getSmartRecommendations);

router.get("/", protect, getFoods);
router.post("/custom", protect, createCustomFood);
router.put("/custom/:id", protect, updateCustomFood);
router.delete("/custom/:id", protect, deleteCustomFood);

module.exports = router;
