const axios = require("axios");
const Ingredient = require("../models/Ingredient");
const catchAsync = require("../utils/catchAsync");

/** Escape user input so it can be used safely inside a MongoDB $regex. */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Map a MongoDB Ingredient document to the unified shape expected by the client
 * (camelCase micros to match foods / CreateFood state).
 */
function mapLocalIngredient(doc) {
  const m = doc.micros || {};
  return {
    _id: String(doc._id),
    name: doc.name,
    category: doc.category,
    price: doc.price ?? 0,
    unit: doc.unit,
    image: doc.image,
    calories: doc.calories ?? 0,
    protein: doc.protein ?? 0,
    carbs: doc.carbs ?? 0,
    fats: doc.fats ?? 0,
    micros: {
      iron: m.iron ?? 0,
      calcium: m.calcium ?? 0,
      vitaminC: m.vitamin_c ?? m.vitaminC ?? 0,
      fiber: m.fiber ?? 0,
      sugar: m.sugar ?? 0,
      sodium: m.sodium ?? 0,
    },
    type: "raw",
    source: "local",
  };
}

/**
 * Map Edamam parser `food` object nutrients to the same schema as local ingredients.
 * Nutrient codes follow Edamam/USDA-style keys on `food.nutrients`.
 */
function mapEdamamFood(food) {
  const n = food.nutrients || {};
  const num = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);

  return {
    _id: `edamam:${food.foodId}`,
    edamamFoodId: food.foodId,
    name: food.label || food.knownAs || "Unknown food",
    category: food.category || food.categoryLabel,
    price: 0,
    unit: "g",
    image: food.image,
    calories: num(n.ENERC_KCAL),
    protein: num(n.PROCNT),
    fats: num(n.FAT),
    carbs: num(n.CHOCDF),
    micros: {
      iron: num(n.FE),
      calcium: num(n.CA),
      vitaminC: num(n.VITC),
      fiber: num(n.FIBTG),
      sugar: num(n.SUGAR),
      sodium: num(n.NA),
    },
    type: "raw",
    source: "edamam",
  };
}

const EDAMAM_PARSER_URL =
  "https://api.edamam.com/api/food-database/v2/parser";

/**
 * GET /api/ingredients/search-nutrition
 *
 * Cascading search strategy (Viva / defense notes):
 * 1. Phase 1 — Local first: query MongoDB `Ingredient` with a case-insensitive
 *    regex on `name` so Nepali / custom entries in our DB are always preferred.
 * 2. Phase 2 — Global fallback: call Edamam’s `/parser` only when local hits
 *    are sparse (< 3) OR the client sends `includeGlobal=true` so the user
 *    can explicitly widen the search to the global database.
 * 3. Merge: return one array — locals tagged `source: 'local'`, API rows
 *    tagged `source: 'edamam'`, with stable nutrition field names for the UI.
 */
const searchNutrition = catchAsync(async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const includeGlobal =
    req.query.includeGlobal === "true" || req.query.includeGlobal === "1";

  if (!q) {
    return res.status(200).json({ success: true, data: [] });
  }

  const safe = escapeRegex(q);
  const localDocs = await Ingredient.find({
    name: { $regex: safe, $options: "i" },
  })
    .limit(30)
    .lean();

  const localResults = localDocs.map(mapLocalIngredient);

  /**
   * We only hit Edamam when:
   * - local matches are fewer than 3 (automatic fallback), OR
   * - the user explicitly asked for global results (`includeGlobal`).
   */
  const shouldCallEdamam =
    localResults.length < 3 || includeGlobal === true;

  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  let edamamResults = [];

  if (shouldCallEdamam && appId && appKey) {
    try {
      const { data } = await axios.get(EDAMAM_PARSER_URL, {
        params: {
          ingr: q,
          app_id: appId,
          app_key: appKey,
        },
        timeout: 12_000,
      });

      const hints = Array.isArray(data.hints) ? data.hints : [];
      const localNames = new Set(
        localResults.map((item) => item.name.toLowerCase()),
      );

      edamamResults = hints
        .map((hint) => (hint && hint.food ? mapEdamamFood(hint.food) : null))
        .filter(Boolean)
        .filter(
          (item) => !localNames.has(item.name.toLowerCase()),
        )
        .slice(0, 20);
    } catch (err) {
      // If Edamam fails, still return local matches so the Cook flow works offline.
      console.error("Edamam parser error:", err.message || err);
    }
  }

  const merged = [...localResults, ...edamamResults];

  res.status(200).json({ success: true, data: merged });
});

const getIngredients = catchAsync(async (req, res) => {
  const ingredients = await Ingredient.find();
  res.json(ingredients);
});

module.exports = { getIngredients, searchNutrition };
