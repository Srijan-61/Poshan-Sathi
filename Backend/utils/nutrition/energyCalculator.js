/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
const calculateBMR = (age, gender, weight, height) => {
  let bmr;
  
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else if (gender === 'female') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  } else {
    // For 'other' gender, use average
    const maleBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const femaleBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    bmr = (maleBMR + femaleBMR) / 2;
  }
  
  return bmr;
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,           // Little or no exercise
    lightlyActive: 1.375,      // Light exercise 1-3 days/week
    moderatelyActive: 1.55,    // Moderate exercise 3-5 days/week
    veryActive: 1.725,         // Hard exercise 6-7 days/week
    extraActive: 1.9           // Very hard exercise, physical job
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return bmr * multiplier;
};

/**
 * Adjust calories based on health goals
 */
const adjustCaloriesForGoal = (tdee, primaryGoal, weeklyWeightGoal = 0.5, gender = 'other') => {
  // Calculator-style conversion: ~7700 kcal per kg body weight.
  const minCaloriesByGender = {
    male: 1500,
    female: 1200,
    other: 1350
  };
  const minCalories = minCaloriesByGender[gender] || minCaloriesByGender.other;

  const fallbackGoalRate = {
    weightLoss: -0.5,
    weightGain: 0.5,
    muscleGain: 0.25
  };

  let weeklyChangeKg = Number(weeklyWeightGoal);
  if (Number.isNaN(weeklyChangeKg) || weeklyChangeKg <= 0) {
    weeklyChangeKg = Math.abs(fallbackGoalRate[primaryGoal] || 0);
  }

  // Keep recommendations in a realistic range.
  weeklyChangeKg = Math.min(Math.max(weeklyChangeKg, 0), 1);

  let calorieDelta = 0;
  if (primaryGoal === 'weightLoss') {
    calorieDelta = -((weeklyChangeKg * 7700) / 7);
  } else if (primaryGoal === 'weightGain') {
    calorieDelta = (weeklyChangeKg * 7700) / 7;
  } else if (primaryGoal === 'muscleGain') {
    calorieDelta = Math.min((weeklyChangeKg * 7700) / 7, 400);
  }

  const recommended = tdee + calorieDelta;
  return Math.max(minCalories, Math.round(recommended));
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  adjustCaloriesForGoal
};
