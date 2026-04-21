const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllFoods,
  createGlobalFood,
  updateGlobalFood,
  deleteFood,
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/adminController");

// Admin Check Middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Access denied. Admins only." });
};

// User Routes
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.delete("/users/:id", protect, admin, deleteUser);

// Food Routes (using Multer for image uploads)
router.get("/foods", protect, admin, getAllFoods);
router.post("/foods", protect, admin, upload.single("image"), createGlobalFood);
router.put(
  "/foods/:id",
  protect,
  admin,
  upload.single("image"),
  updateGlobalFood,
);
router.delete("/foods/:id", protect, admin, deleteFood);

// Ingredient Routes (using Multer for image uploads)
router.get("/ingredients", protect, admin, getAllIngredients);
router.post(
  "/ingredients",
  protect,
  admin,
  upload.single("image"),
  createIngredient,
);
router.put(
  "/ingredients/:id",
  protect,
  admin,
  upload.single("image"),
  updateIngredient,
);
router.delete("/ingredients/:id", protect, admin, deleteIngredient);

module.exports = router;
