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
    sodium: Number,       // mg
    sugar: Number         // grams
  },

  // User-defined health monitoring targets (displayed on dashboard HealthTargetsCard)
  // Each entry represents one nutrient the user wants to monitor with a min or max limit
  customHealthTargets: [{
    nutrient: {
      type: String,
      required: true,
      enum: ['sugar', 'sodium', 'iron', 'calcium', 'fiber', 'protein', 'carbs', 'fats', 'vitaminC', 'potassium', 'magnesium', 'zinc']
    },
    type: {
      type: String,
      required: true,
      enum: ['min', 'max']
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    label: {
      type: String,
      default: ''
    },
    _id: false
  }]
}, { _id: false });

module.exports = nutrientGoalsSchema;
