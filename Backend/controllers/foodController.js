const mongoose = require("mongoose");
const Food = require("../models/Food");
const Log = require("../models/Log");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/** Prevent user search input from breaking MongoDB $regex (invalid patterns throw). */
function escapeRegex(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toObjectId(id) {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  try {
    return new mongoose.Types.ObjectId(id.toString());
  } catch {
    return null;
  }
}

/**
 * Foods visible to the logged-in user: global catalog (no owner) + their own custom foods.
 */
const accessibleFoodsFilter = (userId) => {
  if (!userId) {
    return { owner: null };
  }
  return {
    $or: [{ owner: null }, { owner: userId }],
  };
};

const getFoods = catchAsync(async (req, res) => {
  const userId = toObjectId(req.user._id);
  const { page, limit, search, category } = req.query;

  const baseFilter = accessibleFoodsFilter(userId);

  // If no pagination params → return ALL accessible foods (backward-compatible for useAppData)
  if (!page && !limit) {
    const foods = await Food.find(baseFilter);
    return res.json(foods);
  }

  // Paginated response for Food Library
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * pageSize;

  const filter = { ...baseFilter };
  if (search && String(search).trim()) {
    filter.food_name = {
      $regex: escapeRegex(String(search).trim()),
      $options: "i",
    };
  }
  const cat =
    typeof category === "string"
      ? category
      : Array.isArray(category)
        ? category[0]
        : "";
  if (cat && cat !== "All") {
    filter.category = cat;
  }

  const [foods, totalCount] = await Promise.all([
    Food.find(filter).skip(skip).limit(pageSize).sort({ food_name: 1 }),
    Food.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  res.json({
    foods: foods ?? [],
    page: pageNum,
    totalPages,
    totalCount: totalCount ?? 0,
  });
});

/**
 * Normalize micros from client (camelCase vitaminC) to schema (vitamin_c).
 */
function normalizeMicros(micros) {
  if (!micros || typeof micros !== "object") return micros;
  const m = { ...micros };
  if (m.vitaminC != null && m.vitamin_c == null) {
    m.vitamin_c = m.vitaminC;
    delete m.vitaminC;
  }
  return m;
}

const createCustomFood = catchAsync(async (req, res) => {
  const {
    owner: _ignoreOwner,
    _id: _ignoreId,
    __v: _ignoreV,
    ...body
  } = req.body;

  if (!body.food_name || String(body.food_name).trim() === "") {
    throw new AppError("Food name is required", 400);
  }

  body.micros = normalizeMicros(body.micros);

  const newFood = await Food.create({
    ...body,
    owner: req.user._id,
  });

  res.status(201).json(newFood);
});

const getSmartRecommendations = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id || req.user.id);
  if (!user) throw new AppError("User not found", 404);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const logs = await Log.find({
    user: user._id,
    date: { $gte: startOfToday },
  });

  const spentToday = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const eatenToday = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

  const proteinToday = logs.reduce(
    (sum, log) => sum + (log.protein || log.calories * 0.03 || 0),
    0,
  );
  const carbsToday = logs.reduce(
    (sum, log) => sum + (log.carbs || log.calories * 0.12 || 0),
    0,
  );

  const monthlyBudget = user.monthlyBudget || 0;
  const dailyBudget = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 0;
  const dailyCalories = user.dailyCalories || 2000;
  const dailyProteinGoal = Math.round((dailyCalories * 0.3) / 4);

  const remainingBudget = dailyBudget > 0 ? dailyBudget - spentToday : Infinity;
  const remainingCalories = dailyCalories - eatenToday;

  const foods = await Food.find(accessibleFoodsFilter(toObjectId(req.user._id)));
  let insights = [];

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

    if (dailyBudget > 0 && spentToday > dailyBudget * 0.75 && remainingBudget > 0) {
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
});

const updateCustomFood = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    owner: _ignoreOwner,
    _id: _ignoreId,
    __v: _ignoreV,
    ...body
  } = req.body;

  if (body.food_name && String(body.food_name).trim() === "") {
    throw new AppError("Food name cannot be empty", 400);
  }

  if (body.micros) {
    body.micros = normalizeMicros(body.micros);
  }

  const food = await Food.findOne({ _id: id, owner: req.user._id });

  if (!food) {
    throw new AppError("Custom food not found or you do not have permission to edit it", 404);
  }

  Object.assign(food, body);
  await food.save();

  res.status(200).json(food);
});

const deleteCustomFood = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const food = await Food.findOneAndDelete({ _id: id, owner: req.user._id });

  if (!food) {
    throw new AppError("Custom food not found or you do not have permission to delete it", 404);
  }

  res.status(200).json({ success: true, message: "Custom food deleted successfully" });
});

module.exports = {
  getFoods,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
  getSmartRecommendations,
};
