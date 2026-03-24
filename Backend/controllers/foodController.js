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
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const logs = await Log.find({
      user: user._id,
      date: { $gte: startOfToday },
    });

    const spentToday = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const eatenToday = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

    // Fallback to estimations if macro fields are undefined
    const proteinToday = logs.reduce(
      (sum, log) => sum + (log.protein || log.calories * 0.03 || 0),
      0,
    );
    const carbsToday = logs.reduce(
      (sum, log) => sum + (log.carbs || log.calories * 0.12 || 0),
      0,
    );

    const dailyBudget = user.dailyBudget || 500;
    const dailyCalories = user.dailyCalories || 2000;
    const dailyProteinGoal = Math.round((dailyCalories * 0.3) / 4);

    const remainingBudget = dailyBudget - spentToday;
    const remainingCalories = dailyCalories - eatenToday;

    const foods = await Food.find({});
    let insights = [];

    // CLAUDE LOGIC 1: Empty State
    if (eatenToday === 0) {
      insights.push({
        id: "empty-state",
        title: "No Meals Logged",
        message: "Start your day with a nutritious breakfast!",
        icon: "wb_twilight",
        colorClass: "bg-blue-50 text-blue-800 border-blue-200",
        suggestions: foods.filter((f) => f.calories <= 450).slice(0, 4),
      });
    } else {
      // CLAUDE LOGIC 2: Protein Deficiency
      if (proteinToday < dailyProteinGoal * 0.7) {
        insights.push({
          id: "low-protein",
          title: "Protein Deficiency",
          message: `You need ${(dailyProteinGoal - proteinToday).toFixed(0)}g more protein today.`,
          icon: "fitness_center",
          colorClass: "bg-red-50 text-red-800 border-red-200",
          suggestions: foods
            .filter((f) => (f.protein || 0) >= 10 && f.price <= remainingBudget)
            .slice(0, 4),
        });
      }

      // CLAUDE LOGIC 3: Health Conditions
      if (user.healthcondition === "anemia") {
        insights.push({
          id: "anemia-iron",
          title: "Iron Boost Needed",
          message:
            "Eat iron-rich foods with vitamin C sources for better absorption.",
          icon: "bloodtype",
          colorClass: "bg-red-50 text-red-800 border-red-200",
          suggestions: foods
            .filter(
              (f) => (f.micros?.iron || 0) >= 3 && f.price <= remainingBudget,
            )
            .slice(0, 4),
        });
      } else if (user.healthcondition === "diabetes") {
        const carbPercentage = ((carbsToday * 4) / (eatenToday || 1)) * 100;
        if (carbPercentage > 50) {
          insights.push({
            id: "diabetes-sugar",
            title: "High Carbs Alert",
            message: "Carbohydrates are running high for diabetes management.",
            icon: "monitor_heart",
            colorClass: "bg-red-50 text-red-800 border-red-200",
            suggestions: foods
              .filter((f) => (f.carbs || 0) <= 15 && f.price <= remainingBudget)
              .slice(0, 4),
          });
        }
      }

      // CLAUDE LOGIC 4: Budget Check
      if (spentToday > dailyBudget * 0.75 && remainingBudget > 0) {
        insights.push({
          id: "budget-warning",
          title: "Budget Exceeded Soon",
          message: `You only have NPR ${remainingBudget} left. Overspending can strain your budget.`,
          icon: "account_balance_wallet",
          colorClass: "bg-orange-50 text-orange-800 border-orange-200",
          suggestions: foods
            .filter((f) => f.price > 0 && f.price <= remainingBudget)
            .sort((a, b) => a.price - b.price)
            .slice(0, 4),
        });
      }
    }

    // Fallback if everything is perfect
    if (insights.length === 0) {
      insights.push({
        id: "on-track",
        title: "Nutrition on Track!",
        message: "You are hitting your goals perfectly today.",
        icon: "check_circle",
        colorClass: "bg-green-50 text-green-800 border-green-200",
        suggestions: foods
          .filter(
            (f) =>
              f.price <= remainingBudget && f.calories <= remainingCalories,
          )
          .slice(0, 4),
      });
    }

    res.json({
      remainingBudget,
      remainingCalories,
      insights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFoods, createCustomFood, getSmartRecommendations };
