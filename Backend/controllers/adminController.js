const User = require('../models/User');
const Food = require('../models/Food');
const Ingredient = require('../models/Ingredient');

// Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Toggle role
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    
    res.json({ message: 'User role updated', role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Foods
const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({}).sort({ createdAt: -1 });
    res.json({ foods });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch foods' });
  }
};

const createGlobalFood = async (req, res) => {
  try {
    const foodData = { ...req.body };
    if (req.file) {
      foodData.image = req.file.path || req.file.secure_url || req.body.imageUrl;
    } else if (req.body.imageUrl) {
      foodData.image = req.body.imageUrl;
    }
    
    // Parse keywords safely if coming as a string
    if (typeof foodData.keywords === 'string') {
      foodData.keywords = foodData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    }

    if (typeof foodData.micros === 'string') {
      try { foodData.micros = JSON.parse(foodData.micros); } catch(e){}
    }

    const food = await Food.create(foodData);
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create food' });
  }
};

const updateGlobalFood = async (req, res) => {
  try {
    const foodData = { ...req.body };
    if (req.file) {
      foodData.image = req.file.path || req.file.secure_url || req.body.imageUrl;
    } else if (req.body.imageUrl) {
      foodData.image = req.body.imageUrl;
    }

    // Parse keywords safely if coming as a string
    if (typeof foodData.keywords === 'string') {
      foodData.keywords = foodData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    }

    if (typeof foodData.micros === 'string') {
      try { foodData.micros = JSON.parse(foodData.micros); } catch(e){}
    }

    const food = await Food.findByIdAndUpdate(req.params.id, foodData, { new: true });
    if (!food) return res.status(404).json({ message: 'Food not found' });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update food' });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });
    await food.deleteOne();
    res.json({ message: 'Food removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete food' });
  }
};

// Ingredients
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({}).sort({ createdAt: -1 });
    res.json({ ingredients });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ingredients' });
  }
};

const createIngredient = async (req, res) => {
  try {
    const ingData = { ...req.body };
    if (req.file) {
      ingData.image = req.file.path || req.file.secure_url || req.body.imageUrl;
    } else if (req.body.imageUrl) {
      ingData.image = req.body.imageUrl;
    }

    const ingredient = await Ingredient.create(ingData);
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ingredient' });
  }
};

const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    await ingredient.deleteOne();
    res.json({ message: 'Ingredient removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ingredient' });
  }
};

module.exports = {
  getAllUsers, updateUserRole, deleteUser,
  getAllFoods, createGlobalFood, updateGlobalFood, deleteFood,
  getAllIngredients, createIngredient, deleteIngredient
};
