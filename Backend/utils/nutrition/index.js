const energyCalculator = require('./energyCalculator');
const macroCalculator = require('./macroCalculator');
const microCalculator = require('./microCalculator');


const calculateDailyRequirements = (profile) => {
  const age = Number(profile.age);
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const gender = profile.gender;
  const activityLevel = profile.activityLevel;
  const primaryGoal = profile.healthGoals?.primaryGoal;
  const weeklyWeightGoal = profile.healthGoals?.weeklyWeightGoal;

  if (!age || !weight || !height) {
    throw new Error('Profile requires age, weight, and height for calorie calculation');
  }

  // Energy computations
  const bmr = energyCalculator.calculateBMR(age, gender, weight, height);
  const tdee = energyCalculator.calculateTDEE(bmr, activityLevel);
  const adjustedCalories = energyCalculator.adjustCaloriesForGoal(tdee, primaryGoal, weeklyWeightGoal, gender);

  // Macro computation
  const macroRatios = macroCalculator.getMacroRatios(primaryGoal, profile.healthConditions);
  const macros = macroCalculator.calculateMacros(adjustedCalories, macroRatios);

  // Micro computation
  const micros = microCalculator.calculateMicronutrients(age, gender, profile.healthConditions, profile.dietType);

  return {
    calories: Math.round(adjustedCalories),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),

    // Macros
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fats: Math.round(macros.fats),

    // Micros mapping straight across
    fiber: micros.fiber,
    sugar: micros.sugar,
    sodium: micros.sodium,
    iron: micros.iron,
    calcium: micros.calcium,
    vitaminD: micros.vitaminD,
    vitaminB12: micros.vitaminB12,
    vitaminC: micros.vitaminC,
    vitaminA: micros.vitaminA,
    potassium: micros.potassium,
    magnesium: micros.magnesium,
    zinc: micros.zinc,

    // Ratios
    proteinRatio: macroRatios.protein,
    carbRatio: macroRatios.carbs,
    fatRatio: macroRatios.fats,

    lastCalculated: new Date()
  };
};

/**
 * Apply custom nutrient targets securely on top of generated numbers
 */
const applyCustomTargets = (calculatedRequirements, customTargets) => {
  if (!customTargets) return calculatedRequirements;

  const requirements = { ...calculatedRequirements };

  if (customTargets.protein) requirements.protein = customTargets.protein;
  if (customTargets.carbs) requirements.carbs = customTargets.carbs;
  if (customTargets.fats) requirements.fats = customTargets.fats;
  if (customTargets.fiber) requirements.fiber = customTargets.fiber;
  if (customTargets.iron) requirements.iron = customTargets.iron;
  if (customTargets.calcium) requirements.calcium = customTargets.calcium;
  if (customTargets.sodium) requirements.sodium = customTargets.sodium;

  // Re-weigh calories based on overriden macro grams
  if (customTargets.protein || customTargets.carbs || customTargets.fats) {
    requirements.calories = 
      (requirements.protein * 4) + 
      (requirements.carbs * 4) + 
      (requirements.fats * 9);
  }

  return requirements;
};

module.exports = {
  calculateDailyRequirements,
  applyCustomTargets
};
