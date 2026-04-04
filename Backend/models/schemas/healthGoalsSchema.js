const mongoose = require('mongoose');

const healthGoalsSchema = new mongoose.Schema({
  primaryGoal: {
    type: String,
    required: true,
    enum: ['weightLoss', 'weightGain', 'muscleGain', 'maintainWeight', 'improveHealth', 'manageCondition', 'increaseEnergy'],
    default: 'maintainWeight'
  },
  targetWeight: {
    type: Number,
    min: 0
  },
  targetDate: {
    type: Date
  },
  weeklyWeightGoal: {
    type: Number, // kg per week (0.25, 0.5, 1.0)
    default: 0.5
  }
}, { _id: false });

module.exports = healthGoalsSchema;
