const Food = require('../models/Food');

const getFoods = async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
};

const createCustomFood = async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.json(newFood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getFoods, createCustomFood };