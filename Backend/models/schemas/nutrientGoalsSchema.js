const mongoose = require('mongoose');

const nutrientGoalsSchema = new mongoose.Schema({
  trackProtein: { type: Boolean, default: true },
  trackCarbs: { type: Boolean, default: true },
  trackFats: { type: Boolean, default: true },
  trackFiber: { type: Boolean, default: false },
  trackSugar: { type: Boolean, default: false },
  trackSodium: { type: Boolean, default: false },
  trackIron: { type: Boolean, default: false },
  trackCalcium: { type: Boolean, default: false },
  trackVitaminD: { type: Boolean, default: false },
  trackVitaminB12: { type: Boolean, default: false },
  trackPotassium: { type: Boolean, default: false },
  
  // Custom nutrient targets (if user wants to override calculated values)
  customTargets: {
    protein: Number,      // grams
    carbs: Number,        // grams
    fats: Number,         // grams
    fiber: Number,        // grams
    iron: Number,         // mg
    calcium: Number,      // mg
    sodium: Number        // mg
  }
}, { _id: false });

module.exports = nutrientGoalsSchema;
