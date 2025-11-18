const mongoose = require('mongoose');
const FoodItem = require('./models/FoodItem');

const indianFoods = [
  // Rotis
  { name: 'Wheat Roti', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2, sugar: 0, sodium: 120 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Ragi Roti', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 65, protein: 2.5, carbs: 13, fat: 0.5, fiber: 3, sugar: 0, sodium: 100 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Multigrain Roti', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 75, protein: 3.5, carbs: 14, fat: 0.8, fiber: 3.5, sugar: 0, sodium: 110 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Jowar Roti', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 68, protein: 2.8, carbs: 14, fat: 0.6, fiber: 2.5, sugar: 0, sodium: 95 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Plain Paratha', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 126, protein: 3, carbs: 18, fat: 5, fiber: 2, sugar: 0, sodium: 200 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  
  // Rice
  { name: 'White Rice (Cooked)', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0, sodium: 2 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Brown Rice (Cooked)', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 218, protein: 5, carbs: 46, fat: 1.6, fiber: 3.5, sugar: 0, sodium: 2 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Basmati Rice (Cooked)', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 191, protein: 4, carbs: 41, fat: 0.5, fiber: 0.7, sugar: 0, sodium: 5 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Jeera Rice', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 230, protein: 4.5, carbs: 43, fat: 4, fiber: 1, sugar: 0, sodium: 350 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  
  // Dal
  { name: 'Moong Dal (Cooked)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 212, protein: 14, carbs: 39, fat: 0.8, fiber: 15, sugar: 2, sodium: 15 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Masoor Dal (Cooked)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16, sugar: 2, sodium: 10 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Toor Dal (Cooked)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 203, protein: 11, carbs: 38, fat: 0.7, fiber: 12, sugar: 2, sodium: 12 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Chana Dal (Cooked)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 269, protein: 15, carbs: 45, fat: 4, fiber: 12, sugar: 3, sodium: 18 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Rajma (Cooked)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 225, protein: 15, carbs: 40, fat: 0.9, fiber: 13, sugar: 2, sodium: 20 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  
  // Sabzi
  { name: 'Mixed Veg Sabzi', category: 'sabzi', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 85, protein: 3, carbs: 12, fat: 3, fiber: 4, sugar: 5, sodium: 250 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Palak Paneer', category: 'sabzi', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 180, protein: 12, carbs: 8, fat: 12, fiber: 3, sugar: 2, sodium: 400 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Aloo Gobi', category: 'sabzi', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 150, protein: 4, carbs: 22, fat: 5, fiber: 4, sugar: 4, sodium: 350 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Bhindi Masala', category: 'sabzi', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 95, protein: 3, carbs: 10, fat: 5, fiber: 5, sugar: 3, sodium: 280 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  
  // Paneer & Protein
  { name: 'Paneer (Raw)', category: 'paneer', servingSize: { amount: 100, unit: 'gram' }, nutrition: { calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, sugar: 1, sodium: 18 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Tofu', category: 'paneer', servingSize: { amount: 100, unit: 'gram' }, nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Boiled Egg', category: 'other', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, sugar: 0.6, sodium: 62 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  { name: 'Sprouted Moong', category: 'snacks', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 31, protein: 3, carbs: 6, fat: 0.2, fiber: 2, sugar: 2, sodium: 6 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  
  // Breakfast
  { name: 'Poha', category: 'breakfast', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 180, protein: 3, carbs: 35, fat: 3, fiber: 2, sugar: 2, sodium: 300 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Upma', category: 'breakfast', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 200, protein: 5, carbs: 38, fat: 4, fiber: 3, sugar: 1, sodium: 400 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Idli', category: 'breakfast', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 39, protein: 2, carbs: 8, fat: 0.2, fiber: 0.8, sugar: 0, sodium: 65 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Dosa (Plain)', category: 'breakfast', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 133, protein: 4, carbs: 25, fat: 2, fiber: 1.5, sugar: 0, sodium: 180 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Oats (Cooked)', category: 'breakfast', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 166, protein: 6, carbs: 28, fat: 3.6, fiber: 4, sugar: 0, sodium: 9 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  
  // Snacks
  { name: 'Roasted Chana', category: 'snacks', servingSize: { amount: 30, unit: 'gram' }, nutrition: { calories: 105, protein: 6, carbs: 18, fat: 1.5, fiber: 5, sugar: 2, sodium: 5 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Makhana (Roasted)', category: 'snacks', servingSize: { amount: 30, unit: 'gram' }, nutrition: { calories: 105, protein: 3, carbs: 20, fat: 0.3, fiber: 3, sugar: 0, sodium: 2 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Banana Chips', category: 'snacks', servingSize: { amount: 30, unit: 'gram' }, nutrition: { calories: 147, protein: 0.7, carbs: 16, fat: 9.5, fiber: 2, sugar: 10, sodium: 2 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Almonds', category: 'snacks', servingSize: { amount: 10, unit: 'piece' }, nutrition: { calories: 69, protein: 2.5, carbs: 2.5, fat: 6, fiber: 1.2, sugar: 0.5, sodium: 0 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  { name: 'Walnuts', category: 'snacks', servingSize: { amount: 10, unit: 'gram' }, nutrition: { calories: 65, protein: 1.5, carbs: 1.4, fat: 6.5, fiber: 0.7, sugar: 0.3, sodium: 0 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  
  // Fruits
  { name: 'Apple', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  { name: 'Banana', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1 }, isIndian: false, isPCOSFriendly: false, isLowGI: false },
  { name: 'Papaya', category: 'fruits', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 62, protein: 0.7, carbs: 16, fat: 0.4, fiber: 2.5, sugar: 11, sodium: 12 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Guava', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 37, protein: 1.4, carbs: 8, fat: 0.5, fiber: 3, sugar: 5, sodium: 1 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Orange', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, sugar: 12, sodium: 0 }, isIndian: false, isPCOSFriendly: true, isLowGI: true },
  
  // Sweets (with warnings)
  { name: 'Gulab Jamun', category: 'sweets', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 175, protein: 3, carbs: 25, fat: 7, fiber: 0.5, sugar: 20, sodium: 45 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Jalebi', category: 'sweets', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 150, protein: 1, carbs: 28, fat: 4, fiber: 0, sugar: 22, sodium: 30 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Rasgulla', category: 'sweets', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 106, protein: 4, carbs: 18, fat: 2, fiber: 0, sugar: 16, sodium: 25 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  
  // Beverages
  { name: 'Chai (with milk & sugar)', category: 'beverages', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 80, protein: 2, carbs: 12, fat: 2.5, fiber: 0, sugar: 10, sodium: 35 }, isIndian: true, isPCOSFriendly: false, isLowGI: false },
  { name: 'Buttermilk', category: 'beverages', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 40, protein: 2, carbs: 5, fat: 1, fiber: 0, sugar: 4, sodium: 180 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
  { name: 'Coconut Water', category: 'beverages', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 46, protein: 1.7, carbs: 9, fat: 0.5, fiber: 2.6, sugar: 6, sodium: 252 }, isIndian: true, isPCOSFriendly: true, isLowGI: true }
];

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/crowd-delivery');
    console.log('Connected to MongoDB');
    
    await FoodItem.deleteMany({});
    console.log('Cleared existing food items');
    
    await FoodItem.insertMany(indianFoods);
    console.log(`Seeded ${indianFoods.length} food items`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
