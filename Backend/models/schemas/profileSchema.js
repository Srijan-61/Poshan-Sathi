const mongoose = require('mongoose');
const healthGoalsSchema = require('./healthGoalsSchema');
const nutrientGoalsSchema = require('./nutrientGoalsSchema');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be positive'],
    max: [120, 'Age must be valid']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [1, 'Weight must be positive'],
    unit: { type: String, default: 'kg' }
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [1, 'Height must be positive'],
    unit: { type: String, default: 'cm' }
  },
  dateOfBirth: { type: Date },
  
  // Activity Level
  activityLevel: {
    type: String,
    required: true,
    enum: ['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive'],
    default: 'moderatelyActive'
  },
  
  // Health Conditions
  healthConditions: [{
    type: String,
    enum: ['none', 'anemia', 'diabetes', 'preDiabetes', 'hypertension', 'heartDisease', 'thyroid', 'pcod', 'gastritis', 'kidneyDisease', 'liverDisease', 'cholesterol', 'other']
  }],
  
  // Food Preferences
  dietType: {
    type: String,
    required: true,
    enum: ['vegetarian', 'nonVegetarian', 'vegan', 'eggetarian', 'pescatarian', 'flexitarian'],
    default: 'nonVegetarian'
  },
  
  // Nested Subschemas
  healthGoals: healthGoalsSchema,
  nutrientGoals: nutrientGoalsSchema,
  
  // Budget Settings
  monthlyBudget: { type: Number, min: 0 },
  
  // Location
  location: {
    city: String,
    region: {
      type: String,
      enum: ['kathmandu', 'pokhara', 'terai', 'mountain', 'hill', 'other']
    }
  },
  profileImage: { type: String, default: '' }
}, { _id: false });

module.exports = profileSchema;
