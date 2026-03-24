

class NutritionCalculator {
  
  /**
   * Calculate all daily nutritional requirements for a user
   * @param {Object} profile - User profile data
   * @returns {Object} Daily requirements
   */
  calculateDailyRequirements(profile) {
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

    // Calculate BMR
    const bmr = this.calculateBMR(age, gender, weight, height);
    
    // Calculate TDEE
    const tdee = this.calculateTDEE(bmr, activityLevel);
    
    // Adjust for health goals
    const adjustedCalories = this.adjustCaloriesForGoal(
      tdee, 
      primaryGoal,
      weeklyWeightGoal,
      gender
    );
    
    // Calculate macro ratios based on goals
    const macroRatios = this.getMacroRatios(
      primaryGoal,
      profile.healthConditions
    );
    
    // Calculate macronutrients
    const macros = this.calculateMacros(adjustedCalories, macroRatios);
    
    // Calculate micronutrients
    const micros = this.calculateMicronutrients(
      profile.age,
      profile.gender,
      profile.healthConditions,
      profile.dietType
    );
    
    return {
      calories: Math.round(adjustedCalories),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      
      // Macros
      protein: Math.round(macros.protein),
      carbs: Math.round(macros.carbs),
      fats: Math.round(macros.fats),
      
      // Micros
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
  }
  
  /**
   * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
   * More accurate than Harris-Benedict for modern populations
   */
  calculateBMR(age, gender, weight, height) {
    // Mifflin-St Jeor Equation
    // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
    // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
    
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
  }
  
  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,           // Little or no exercise
      lightlyActive: 1.375,      // Light exercise 1-3 days/week
      moderatelyActive: 1.55,    // Moderate exercise 3-5 days/week
      veryActive: 1.725,         // Hard exercise 6-7 days/week
      extraActive: 1.9           // Very hard exercise, physical job
    };
    
    const multiplier = activityMultipliers[activityLevel] || 1.55;
    return bmr * multiplier;
  }
  
  /**
   * Adjust calories based on health goals
   */
  adjustCaloriesForGoal(tdee, primaryGoal, weeklyWeightGoal = 0.5, gender = 'other') {
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
  }
  
  /**
   * Get macro ratios based on goals and conditions
   */
  getMacroRatios(primaryGoal, healthConditions = []) {
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
  }
  
  /**
   * Calculate macronutrients in grams
   */
  calculateMacros(calories, ratios) {
    // Protein: 4 cal/gram
    // Carbs: 4 cal/gram
    // Fats: 9 cal/gram
    
    return {
      protein: (calories * (ratios.protein / 100)) / 4,
      carbs: (calories * (ratios.carbs / 100)) / 4,
      fats: (calories * (ratios.fats / 100)) / 9
    };
  }
  
  /**
   * Calculate micronutrient requirements
   */
  calculateMicronutrients(age, gender, healthConditions = [], dietType) {
    const micros = {
      fiber: 25,      // grams
      sugar: 50,      // grams (max)
      sodium: 2300,   // mg (max)
      iron: 18,       // mg
      calcium: 1000,  // mg
      vitaminD: 600,  // IU
      vitaminB12: 2.4, // mcg
      vitaminC: 90,   // mg
      vitaminA: 900,  // mcg
      potassium: 3500, // mg
      magnesium: 400, // mg
      zinc: 11        // mg
    };
    
    // Age-based adjustments
    if (age > 50) {
      micros.calcium = 1200;
      micros.vitaminD = 800;
      micros.vitaminB12 = 2.8;
    }
    
    // Gender-based adjustments
    if (gender === 'male') {
      micros.fiber = 30;
      micros.iron = 8;
      micros.zinc = 11;
    } else if (gender === 'female') {
      micros.fiber = 25;
      micros.iron = 18;  // Higher for women (menstruation)
      micros.zinc = 8;
      
      if (age > 50) {
        micros.iron = 8;  // Lower after menopause
      }
    }
    
    // Health condition adjustments
    if (healthConditions.includes('anemia')) {
      micros.iron = Math.max(micros.iron, 20);
    }
    
    if (healthConditions.includes('hypertension')) {
      micros.sodium = 1500;  // Lower sodium
      micros.potassium = 4700; // Higher potassium
    }
    
    if (healthConditions.includes('diabetes')) {
      micros.fiber = 35;  // Higher fiber
      micros.sugar = 25;  // Lower sugar
    }
    
    // Diet type adjustments
    if (dietType === 'vegan' || dietType === 'vegetarian') {
      micros.iron = Math.max(micros.iron, 18);  // Plant-based iron less bioavailable
      micros.vitaminB12 = 5;  // Higher B12 (often deficient in plant-based diets)
      micros.zinc = Math.max(micros.zinc, 12);
      micros.calcium = 1200;
    }
    
    return micros;
  }
  
  /**
   * Apply custom nutrient targets if user has set them
   */
  applyCustomTargets(calculatedRequirements, customTargets) {
    if (!customTargets) return calculatedRequirements;
    
    const requirements = { ...calculatedRequirements };
    
    // Override with custom targets if provided
    if (customTargets.protein) requirements.protein = customTargets.protein;
    if (customTargets.carbs) requirements.carbs = customTargets.carbs;
    if (customTargets.fats) requirements.fats = customTargets.fats;
    if (customTargets.fiber) requirements.fiber = customTargets.fiber;
    if (customTargets.iron) requirements.iron = customTargets.iron;
    if (customTargets.calcium) requirements.calcium = customTargets.calcium;
    if (customTargets.sodium) requirements.sodium = customTargets.sodium;
    
    // Recalculate calories based on custom macros
    if (customTargets.protein || customTargets.carbs || customTargets.fats) {
      requirements.calories = 
        (requirements.protein * 4) + 
        (requirements.carbs * 4) + 
        (requirements.fats * 9);
    }
    
    return requirements;
  }
}

module.exports = new NutritionCalculator();