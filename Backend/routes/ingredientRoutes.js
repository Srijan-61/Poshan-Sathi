const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getIngredients,
  searchNutrition,
} = require("../controllers/ingredientController");

router.get("/search-nutrition", protect, searchNutrition);
router.get("/", getIngredients);

module.exports = router;
