

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Personal Information
  profile: {
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
      unit: {
        type: String,
        default: 'kg'
      }
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [1, 'Height must be positive'],
      unit: {
        type: String,
        default: 'cm'
      }
    },
    dateOfBirth: {
      type: Date
    },
    
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
    
    // Food Allergies & Intolerances
    allergies: [{
      type: String,
      enum: ['none', 'dairy', 'eggs', 'fish', 'shellfish', 'nuts', 'peanuts', 'wheat', 'gluten', 'soy', 'other']
    }],
    
    // Foods to Avoid
    foodsToAvoid: [String],
    
    // Favorite Foods
    favoriteFoods: [String],
    
    // Health Goals
    healthGoals: {
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
    },
    
    // Specific Nutrient Tracking Goals
    nutrientGoals: {
      trackProtein: {
        type: Boolean,
        default: true
      },
      trackCarbs: {
        type: Boolean,
        default: true
      },
      trackFats: {
        type: Boolean,
        default: true
      },
      trackFiber: {
        type: Boolean,
        default: false
      },
      trackSugar: {
        type: Boolean,
        default: false
      },
      trackSodium: {
        type: Boolean,
        default: false
      },
      trackIron: {
        type: Boolean,
        default: false
      },
      trackCalcium: {
        type: Boolean,
        default: false
      },
      trackVitaminD: {
        type: Boolean,
        default: false
      },
      trackVitaminB12: {
        type: Boolean,
        default: false
      },
      trackPotassium: {
        type: Boolean,
        default: false
      },
      
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
    },
    
    // Budget Settings
    monthlyBudget: {
      type: Number,
      min: 0
    },
    budgetPriority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    
    // Lifestyle Preferences
    mealFrequency: {
      type: Number,
      min: 1,
      max: 10,
      default: 3  // meals per day
    },
    cookingTime: {
      type: String,
      enum: ['minimal', 'moderate', 'extensive'],
      default: 'moderate'
    },
    
    // Location (for regional food recommendations)
    location: {
      city: String,
      region: {
        type: String,
        enum: ['kathmandu', 'pokhara', 'terai', 'mountain', 'hill', 'other']
      }
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  
  // Calculated Daily Requirements (auto-calculated)
  dailyRequirements: {
    calories: {
      type: Number,
      default: 2000
    },
    bmr: {
      type: Number  // Basal Metabolic Rate
    },
    tdee: {
      type: Number  // Total Daily Energy Expenditure
    },
    
    // Macronutrients (grams)
    protein: {
      type: Number,
      default: 50
    },
    carbs: {
      type: Number,
      default: 250
    },
    fats: {
      type: Number,
      default: 65
    },
    
    // Micronutrients
    fiber: {
      type: Number,
      default: 25  // grams
    },
    sugar: {
      type: Number,
      default: 50  // grams (max)
    },
    sodium: {
      type: Number,
      default: 2300  // mg (max)
    },
    iron: {
      type: Number,
      default: 18  // mg
    },
    calcium: {
      type: Number,
      default: 1000  // mg
    },
    vitaminD: {
      type: Number,
      default: 600  // IU
    },
    vitaminB12: {
      type: Number,
      default: 2.4  // mcg
    },
    vitaminC: {
      type: Number,
      default: 90  // mg
    },
    vitaminA: {
      type: Number,
      default: 900  // mcg
    },
    potassium: {
      type: Number,
      default: 3500  // mg
    },
    magnesium: {
      type: Number,
      default: 400  // mg
    },
    zinc: {
      type: Number,
      default: 11  // mg
    },
    
    // Macro Ratios (percentage)
    proteinRatio: {
      type: Number,
      default: 30  // % of total calories
    },
    carbRatio: {
      type: Number,
      default: 40
    },
    fatRatio: {
      type: Number,
      default: 30
    },
    
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Profile Completion
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  profileUpdatedAt: {
    type: Date
  }
  
}, {
  timestamps: true  // createdAt, updatedAt
});

// Index for faster queries
userSchema.index({ 'profile.healthGoals.primaryGoal': 1 });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const required = [
    this.profile.name,
    this.profile.age,
    this.profile.gender,
    this.profile.weight,
    this.profile.height,
    this.profile.activityLevel,
    this.profile.dietType,
    this.profile.healthGoals.primaryGoal
  ];
  
  this.isProfileComplete = required.every(field => field !== null && field !== undefined);
  return this.isProfileComplete;
};

module.exports = mongoose.model('User', userSchema);