const express = require("express");
const router = express.Router();
const {
  getFoods,
  createCustomFood,
  getSmartRecommendations,
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getFoods); // Protected route
router.post("/custom", protect, createCustomFood);
router.get("/recommendations", protect, getSmartRecommendations);

module.exports = router;
