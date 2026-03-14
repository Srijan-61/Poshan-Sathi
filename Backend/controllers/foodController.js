const Food = require("../models/Food");
const Log = require("../models/Log");
const User = require("../models/User");

const getFoods = async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
};

const createCustomFood = async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();
    res.json(newFood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSmartRecommendations = async (req, res) => {
  try {
    // 1. Get the user's profile and goals (Using req.user._id is safer for Mongoose)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Calculate what they have already spent and eaten today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // FIX: Changed 'date' to 'createdAt' to match Mongoose timestamps
    const logs = await Log.find({
      user: req.user._id,
      date: { $gte: startOfToday },
    });

    const spentToday = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const eatenToday = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

    // Fallbacks just in case the user hasn't set their goals yet
    const dailyBudget = user.dailyBudget || 500;
    const dailyCalories = user.dailyCalories || 2000;

    const remainingBudget = dailyBudget - spentToday;
    const remainingCalories = dailyCalories - eatenToday;

    // 3. Fetch all foods from the library
    const foods = await Food.find({});

    // 4. Score and filter the foods
    let recommendations = foods.map((food) => {
      let score = 0;

      // Base Score: High protein foods get a slight bump
      score += (food.protein || 0) * 2;

      // Health Condition Multipliers (The Magic!)
      if (user.healthcondition === "anemia" && (food.micros?.iron || 0) >= 5)
        score += 50;
      if (user.healthcondition === "diabetes" && (food.micros?.sugar || 0) <= 5)
        score += 50;
      if (
        user.healthcondition === "hypertension" &&
        (food.micros?.sodium || 0) <= 140
      )
        score += 50;

      return { ...food.toObject(), score };
    });

    // 5. Filter out foods they cannot afford or that ruin their calorie limits
    recommendations = recommendations.filter(
      (f) => f.price <= remainingBudget && f.calories <= remainingCalories,
    );

    // 6. Sort by highest score first
    recommendations.sort((a, b) => b.score - a.score);

    res.json({
      remainingBudget,
      remainingCalories,
      suggestions: recommendations.slice(0, 3), // Send the top 3 best matches!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFoods, createCustomFood, getSmartRecommendations };
