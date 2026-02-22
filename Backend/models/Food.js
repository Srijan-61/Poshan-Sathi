const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  food_name: { type: String, required: true },
  category: String,
  price: Number,
  image: String,
  keywords: [String],
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  micros: {
    iron: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    vitamin_c: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Food', foodSchema);