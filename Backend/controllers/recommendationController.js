const mongoose = require("mongoose");
const Food = require("../models/Food");
const Log = require("../models/Log");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const getRecommendations = catchAsync(async (req, res) => {
  // 1. Get Context: Time of day
  const hour = new Date().getHours();
  let mealType = "Snack";
  if (hour >= 5 && hour < 11) {
    mealType = "Breakfast";
  } else if (hour >= 11 && hour < 16) {
    mealType = "Lunch";
  } else if (hour >= 16 && hour < 22) {
    mealType = "Dinner";
  }

  // 2. Get User Constraints
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const logs = await Log.find({
    user: user._id,
    date: { $gte: startOfToday },
  });

  const spentToday = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const monthlyBudget =
    user.profile && user.profile.monthlyBudget
      ? Number(user.profile.monthlyBudget)
      : 0;
  const dailyBudget = monthlyBudget > 0 ? Math.round(monthlyBudget / 30) : 0;

  const remainingBudget = dailyBudget > 0 ? Math.max(0, dailyBudget - spentToday) : Infinity;

  // 3. Get Preferences
  const dietType = user.profile?.dietType || "nonVegetarian";
  const isVeg = dietType === "vegetarian" || dietType === "vegan";

  // 4. The Query Pipeline
  const matchStage = {
    $match: {
      $and: [
        {
          $or: [
            { owner: null },
            { owner: { $exists: false } },
            { owner: req.user._id },
          ],
        },
        // Only filter by price when a budget is set
        ...(dailyBudget > 0
          ? [
              {
                $or: [
                  { price: { $lte: remainingBudget } },
                  { price: null },
                  { price: { $exists: false } },
                ],
              },
            ]
          : []),
      ],
    },
  };

  if (isVeg) {
    const nonVegKeywords = [
      "chicken",
      "beef",
      "pork",
      "fish",
      "meat",
      "egg",
      "mutton",
      "buff",
    ];
    matchStage.$match.$and.push({
      food_name: { $not: new RegExp(nonVegKeywords.join("|"), "i") },
    });
    matchStage.$match.$and.push({ category: { $ne: "Non-Veg" } });
  }

  const pipeline = [
    matchStage,
    {
      $addFields: {
        isPreferredMeal: {
          $cond: {
            if: {
              $regexMatch: {
                input: { $ifNull: ["$category", ""] },
                regex: new RegExp(mealType, "i"),
              },
            },
            then: 1,
            else: 0,
          },
        },
      },
    },
    // Sort logic: first by time-of-day category match, then highest rating or calories
    { $sort: { isPreferredMeal: -1, calories: -1 } },
    { $limit: 4 },
  ];

  const recommendations = await Food.aggregate(pipeline);

  res.status(200).json({
    success: true,
    mealType,
    remainingBudget,
    recommendations,
  });
});

module.exports = { getRecommendations };
