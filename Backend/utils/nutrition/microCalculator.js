/**
 * Calculate micronutrient requirements and adjust based on demographics/health
 */
const calculateMicronutrients = (age, gender, healthConditions = [], dietType) => {
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
};

module.exports = {
  calculateMicronutrients
};
