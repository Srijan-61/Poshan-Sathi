const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const logRoutes = require("./routes/logRoutes");
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const globalErrorHandler = require('./middleware/errorMiddleware');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/poshansathi")
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" DB Connection Error:", err));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/logs", logRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handling Middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
