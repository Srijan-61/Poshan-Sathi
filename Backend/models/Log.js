const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  food_name: String,
  quantity: Number,
  calories: Number,
  cost: Number,
  date: { type: Date, default: Date.now },

  // Macronutrients
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },

  // Micronutrients & Others
  micros: {
    iron: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
});

// This model allows you to run operations equivalent to 'select * from logs'
module.exports = mongoose.model("Log", logSchema);
