const Ingredient = require('../models/Ingredient');

const getIngredients = async (req, res) => {
  const ingredients = await Ingredient.find();
  res.json(ingredients);
};

module.exports = { getIngredients };