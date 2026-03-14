const express = require("express");
const router = express.Router();
const {
  getFoods,
  createCustomFood,
  getSmartRecommendations,
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

router.get("/recommendations", protect, getSmartRecommendations);

router.get("/", protect, getFoods);
router.post("/custom", protect, createCustomFood);

module.exports = router;
