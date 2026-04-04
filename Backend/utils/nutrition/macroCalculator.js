/**
 * Get macro ratios based on goals and conditions
 */
const getMacroRatios = (primaryGoal, healthConditions = []) => {
  let ratios;
  
  // Base ratios by goal
  switch (primaryGoal) {
    case 'weightLoss':
      ratios = { protein: 35, carbs: 35, fats: 30 }; // Higher protein
      break;
    case 'muscleGain':
      ratios = { protein: 30, carbs: 45, fats: 25 }; // Higher carbs for energy
      break;
    case 'weightGain':
      ratios = { protein: 25, carbs: 50, fats: 25 };
      break;
    default:
      ratios = { protein: 30, carbs: 40, fats: 30 }; // Balanced
  }
  
  // Adjust for health conditions
  if (healthConditions.includes('diabetes') || healthConditions.includes('preDiabetes')) {
    // Lower carbs for diabetes
    ratios = { protein: 35, carbs: 30, fats: 35 };
  }
  
  if (healthConditions.includes('heartDisease') || healthConditions.includes('cholesterol')) {
    // Lower saturated fats
    ratios.fats = Math.min(ratios.fats, 25);
    ratios.carbs += 5;
  }
  
  if (healthConditions.includes('kidneyDisease')) {
    // Lower protein for kidney disease
    ratios.protein = 15;
    ratios.carbs = 55;
    ratios.fats = 30;
  }
  
  return ratios;
};

/**
 * Calculate macronutrients in absolute grams based on caloric total
 */
const calculateMacros = (calories, ratios) => {
  // Protein: 4 cal/gram
  // Carbs: 4 cal/gram
  // Fats: 9 cal/gram
  
  return {
    protein: (calories * (ratios.protein / 100)) / 4,
    carbs: (calories * (ratios.carbs / 100)) / 4,
    fats: (calories * (ratios.fats / 100)) / 9
  };
};

module.exports = {
  getMacroRatios,
  calculateMacros
};
