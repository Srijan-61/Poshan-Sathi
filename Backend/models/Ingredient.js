const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  unit: String,
  image: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  micros: {
    iron: Number, calcium: Number, vitamin_c: Number, 
    fiber: Number, sugar: Number, sodium: Number
  }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);