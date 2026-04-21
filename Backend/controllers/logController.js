const Log = require("../models/Log");

const getLogs = async (req, res) => {
  const range = req.query.range || 'today';
  const specificDate = req.query.date; // e.g. "2026-04-09"
  let startDate, endDate;

  if (specificDate) {
    // Specific date query — for viewing previous logs by date
    startDate = new Date(specificDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(specificDate);
    endDate.setHours(23, 59, 59, 999);
  } else if (req.query.month) {
    // Specific month query — e.g. ?month=2026-03 for budget history
    const [year, mon] = req.query.month.split("-").map(Number);
    startDate = new Date(year, mon - 1, 1);
    endDate = new Date(year, mon, 0, 23, 59, 59, 999); // Last day of that month
  } else if (range === 'month') {
    // Start of current month — for budget analytics
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === 'week') {
    // Last 7 days — for weekly chart
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Default: today only — for daily logs
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
  }

  const dateFilter = endDate
    ? { $gte: startDate, $lte: endDate }
    : { $gte: startDate };

  const logs = await Log.find({
    user: req.user._id,
    date: dateFilter
  }).sort({ date: -1 });

  res.json(logs);
};

const createLog = async (req, res) => {
  try {
    
    const newLog = new Log({
      user: req.user._id,
      food_name: req.body.food_name,
      quantity: req.body.quantity,
      calories: req.body.calories,
      cost: req.body.cost,
      protein: req.body.protein,
      carbs: req.body.carbs,
      fats: req.body.fats,
      micros: req.body.micros, 
    });

    await newLog.save();
    res.json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateLog = async (req, res) => {
  try {
    const { quantity: newQty } = req.body;

    if (!newQty || newQty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const log = await Log.findOne({ _id: req.params.id, user: req.user._id });

    if (!log) {
      return res.status(404).json({ message: "Log not found or unauthorized" });
    }

    const oldQty = log.quantity || 1;
    const ratio = newQty / oldQty;

    log.quantity = newQty;
    log.calories = Math.round(log.calories * ratio);
    log.cost = Math.round(log.cost * ratio * 100) / 100;
    log.protein = Math.round((log.protein || 0) * ratio * 100) / 100;
    log.carbs = Math.round((log.carbs || 0) * ratio * 100) / 100;
    log.fats = Math.round((log.fats || 0) * ratio * 100) / 100;

    if (log.micros) {
      log.micros.iron = Math.round((log.micros.iron || 0) * ratio * 100) / 100;
      log.micros.calcium = Math.round((log.micros.calcium || 0) * ratio * 100) / 100;
      log.micros.vitaminC = Math.round((log.micros.vitaminC || 0) * ratio * 100) / 100;
      log.micros.fiber = Math.round((log.micros.fiber || 0) * ratio * 100) / 100;
      log.micros.sugar = Math.round((log.micros.sugar || 0) * ratio * 100) / 100;
      log.micros.sodium = Math.round((log.micros.sodium || 0) * ratio * 100) / 100;
    }

    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteLog = async (req, res) => {
  const deletedLog = await Log.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.user._id 
  });
  
  if (!deletedLog) {
    return res.status(404).json({ message: "Log not found or unauthorized to delete" });
  }

  res.json({ message: "Deleted" });
};

module.exports = { getLogs, createLog, updateLog, deleteLog };
