const Log = require("../models/Log");

const getLogs = async (req, res) => {
  // Get logs for the last 24 hours
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await Log.find({ 
    user: req.user._id,
    date: { $gte: startOfDay } 
  }).sort({
    date: -1,
  });
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

module.exports = { getLogs, createLog, deleteLog };
