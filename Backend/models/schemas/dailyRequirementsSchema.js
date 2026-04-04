const mongoose = require('mongoose');

const dailyRequirementsSchema = new mongoose.Schema({
  calories: { type: Number, default: 2000 },
  bmr: { type: Number },
  tdee: { type: Number },
  
  // Macronutrients (grams)
  protein: { type: Number, default: 50 },
  carbs: { type: Number, default: 250 },
  fats: { type: Number, default: 65 },
  
  // Micronutrients
  fiber: { type: Number, default: 25 },
  sugar: { type: Number, default: 50 },
  sodium: { type: Number, default: 2300 },
  iron: { type: Number, default: 18 },
  calcium: { type: Number, default: 1000 },
  vitaminD: { type: Number, default: 600 },
  vitaminB12: { type: Number, default: 2.4 },
  vitaminC: { type: Number, default: 90 },
  vitaminA: { type: Number, default: 900 },
  potassium: { type: Number, default: 3500 },
  magnesium: { type: Number, default: 400 },
  zinc: { type: Number, default: 11 },
  
  // Macro Ratios (percentage)
  proteinRatio: { type: Number, default: 30 },
  carbRatio: { type: Number, default: 40 },
  fatRatio: { type: Number, default: 30 },
  
  lastCalculated: { type: Date, default: Date.now }
}, { _id: false });

module.exports = dailyRequirementsSchema;
