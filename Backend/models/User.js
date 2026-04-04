const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import modular subschemas
const profileSchema = require('./schemas/profileSchema');
const dailyRequirementsSchema = require('./schemas/dailyRequirementsSchema');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Mounted Subschemas
  profile: profileSchema,
  dailyRequirements: dailyRequirementsSchema,
  
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

// Method to generate JWT Token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Method to check if profile is complete
userSchema.methods.checkProfileCompletion = function() {
  const required = [
    this.profile?.name,
    this.profile?.age,
    this.profile?.gender,
    this.profile?.weight,
    this.profile?.height,
    this.profile?.activityLevel,
    this.profile?.dietType,
    this.profile?.healthGoals?.primaryGoal
  ];
  
  this.isProfileComplete = required.every(field => field !== null && field !== undefined);
  return this.isProfileComplete;
};

module.exports = mongoose.model('User', userSchema);