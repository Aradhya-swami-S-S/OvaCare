# Diet Tracker - Quick Start

## ✅ What's Ready

### Backend
- FoodItem & FoodLog models
- API endpoints for food search and logging
- 20 pre-seeded Indian foods
- Real-time macro calculations

### Frontend
- Daily Diet Tracker page
- Search and add foods
- Meal categories (Breakfast, Lunch, Dinner, Snacks)
- Daily nutrition summary
- Delete food logs

## 🚀 Setup

1. **Start Backend:**
```bash
cd backend
npx nodemon app.js
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Seed Food Database (First Time Only):**
- Login to your app
- Visit: http://localhost:5000/api/diet/seed (with auth token)
- Or use Postman/Thunder Client with your Bearer token

## 📱 How to Use

1. Click "Diet Tracker" in navbar
2. Click "Add Food" for any meal
3. Search for food (try: roti, rice, dal, paneer, idli)
4. Select food and adjust quantity slider
5. Click "Add Food"
6. View daily totals at top

## 🍽️ Pre-loaded Indian Foods

- Rotis (wheat, multigrain)
- Rice (white, brown)
- Dals (moong, masoor)
- Paneer
- Breakfasts (idli, dosa, poha, upma, paratha)
- Snacks (chana, makhana)
- Fruits (banana, apple, papaya)
- Proteins (egg, chicken, curd)

## ✨ Features

- **Real-time totals** - Updates instantly
- **Accurate macros** - Protein, carbs, fat calculated correctly
- **Portion control** - 0.5x to 5x quantity slider
- **Clean UI** - Card-based, mobile-friendly
- **Fast search** - Find foods quickly
- **Indian-first** - Prioritizes Indian foods

## 🎯 Next Steps (Phase 2)

- Add 100+ more Indian foods
- Smart nutrition suggestions
- PCOS-friendly recommendations
- Recently eaten list
- Copy yesterday's meals
- Weekly graphs
- Hydration tracker

The core tracker is ready to use! 🎉