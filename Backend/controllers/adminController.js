const User = require("../models/User");
const Food = require("../models/Food");
const Ingredient = require("../models/Ingredient");

// Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle role
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.json({ message: "User role updated", role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Foods
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({}).sort({ createdAt: -1 });
    res.json({ foods });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};

const createGlobalFood = async (req, res) => {
  try {
    const foodData = { ...(req.body || {}) };
    foodData.owner = null; // Ensure global

    if (req.file) {
      console.log("📸 Food image uploaded:", req.file.path);
      foodData.image = req.file.path;
    } else if (foodData.imageUrl) {
      foodData.image = foodData.imageUrl;
    }

    // Parse numeric fields for form-data
    ["price", "calories", "protein", "carbs", "fats"].forEach((field) => {
      if (foodData[field] === "" || foodData[field] === undefined) {
        delete foodData[field];
      } else if (typeof foodData[field] === "string") {
        foodData[field] = Number(foodData[field]);
      }
    });

    // Parse keywords safely if coming as a string
    if (typeof foodData.keywords === "string") {
      foodData.keywords = foodData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    // Parse micros if coming as a string (JSON)
    if (typeof foodData.micros === "string") {
      try {
        foodData.micros = JSON.parse(foodData.micros);
      } catch (e) {
        delete foodData.micros;
      }
    }

    // Parse ingredients if coming as a string (JSON)
    if (typeof foodData.ingredients === "string") {
      try {
        foodData.ingredients = JSON.parse(foodData.ingredients);
      } catch (e) {
        delete foodData.ingredients;
      }
    }

    const food = await Food.create(foodData);
    res.status(201).json(food);
  } catch (error) {
    console.error(" Error creating global food:", error);
    res
      .status(500)
      .json({ message: "Failed to create food", error: error.message });
  }
};

const updateGlobalFood = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid food ID format" });
    }

    const foodData = { ...(req.body || {}) };
    delete foodData.owner;

    if (req.file) {
      console.log(" Food image updated:", req.file.path);
      foodData.image = req.file.path;
    } else if (foodData.imageUrl) {
      foodData.image = foodData.imageUrl;
    }

    // Parse numeric fields for form-data
    ["price", "calories", "protein", "carbs", "fats"].forEach((field) => {
      if (foodData[field] === "" || foodData[field] === undefined) {
        delete foodData[field];
      } else if (typeof foodData[field] === "string") {
        foodData[field] = Number(foodData[field]);
      }
    });

    // Parse keywords safely if coming as a string
    if (typeof foodData.keywords === "string") {
      foodData.keywords = foodData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    }

    // Parse micros if coming as a string (JSON)
    if (typeof foodData.micros === "string") {
      try {
        foodData.micros = JSON.parse(foodData.micros);
      } catch (e) {
        delete foodData.micros;
      }
    }

    // Parse ingredients if coming as a string (JSON)
    if (typeof foodData.ingredients === "string") {
      try {
        foodData.ingredients = JSON.parse(foodData.ingredients);
      } catch (e) {
        delete foodData.ingredients;
      }
    }

    const food = await Food.findByIdAndUpdate(req.params.id, foodData, {
      new: true,
    });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    console.error(" Error updating global food:", error);
    res
      .status(500)
      .json({ message: "Failed to update food", error: error.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    await food.deleteOne();
    res.json({ message: "Food removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete food" });
  }
};

// Ingredients
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({}).sort({ createdAt: -1 });
    res.json({ ingredients });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ingredients" });
  }
};

const createIngredient = async (req, res) => {
  try {
    const ingData = { ...req.body };
    if (req.file) {
      console.log("📸 Ingredient image uploaded:", req.file.path);
      ingData.image = req.file.path;
    } else if (req.body.imageUrl) {
      ingData.image = req.body.imageUrl;
    }

    const ingredient = await Ingredient.create(ingData);
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: "Failed to create ingredient" });
  }
};

const updateIngredient = async (req, res) => {
  try {
    const ingData = { ...req.body };

    if (req.file) {
      ingData.image = req.file.path;
    } else if (req.body.imageUrl) {
      ingData.image = req.body.imageUrl;
    }

    // Parse numeric fields coming as strings from form-data
    ["calories", "protein", "carbs", "fats"].forEach((field) => {
      if (ingData[field] !== undefined && typeof ingData[field] === "string") {
        ingData[field] = Number(ingData[field]);
      }
    });

    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, ingData, { new: true });
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    res.json(ingredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({ message: "Failed to update ingredient", error: error.message });
  }
};

const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });
    await ingredient.deleteOne();
    res.json({ message: "Ingredient removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ingredient" });
  }
};

module.exports = {
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
};
