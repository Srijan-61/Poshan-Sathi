const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Food = require('./models/Food');
const Ingredient = require('./models/Ingredient');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/poshansathi')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    const foods = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'foods.json'), 'utf-8'));
    const ingredients = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ingredients.json'), 'utf-8'));

    await Food.deleteMany({});
    await Ingredient.deleteMany({});
    
    await Food.insertMany(foods);
    await Ingredient.insertMany(ingredients);
    
    console.log(`🌱 Seeded ${foods.length} Foods & ${ingredients.length} Ingredients`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();