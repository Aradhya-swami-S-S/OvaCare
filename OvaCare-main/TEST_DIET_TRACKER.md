# Diet Tracker Testing Guide

## Quick Test Checklist

### 1. Backend Setup ✅
```bash
cd backend
npm start
```
Expected: `Server running on port 5000`

### 2. Frontend Setup ✅
```bash
cd frontend
npm run dev
```
Expected: `Local: http://localhost:5173`

### 3. Database Seeded ✅
Already done! 43 foods loaded.

## Test Scenarios

### Test 1: Add Food to Breakfast
1. Navigate to Diet Tracker page
2. Click "Add Food" on Breakfast
3. Search for "idli"
4. Select Idli (39 cal)
5. Adjust quantity to 3
6. Click "Add to Meal"
7. ✅ Should see: 3 idlis, 117 calories

### Test 2: View Nutrition Summary
1. Add multiple foods
2. Check sticky summary bar at top
3. ✅ Should see:
   - Total calories updating
   - Protein, Carbs, Fat, Fiber bars
   - Color-coded progress (red/yellow/green)

### Test 3: Smart Recommendations
1. Add only high-carb foods (rice, paratha)
2. ✅ Should see recommendation:
   - "Consider reducing refined carbs"
   - "You're low on protein"

### Test 4: PCOS-Friendly Tags
1. Search for "brown rice"
2. ✅ Should see tags:
   - "PCOS-Friendly" (green)
   - "Low-GI" (blue)
   - "Indian" (orange)

### Test 5: Date Navigation
1. Click left arrow to go to yesterday
2. Add some foods
3. Click right arrow to return to today
4. ✅ Should see different meals for each day

### Test 6: Delete Food Log
1. Add a food item
2. Click trash icon
3. ✅ Should:
   - Remove item instantly
   - Update totals
   - Update recommendations

### Test 7: Search Functionality
1. Open Add Food modal
2. Type "dal"
3. ✅ Should see:
   - Moong Dal
   - Masoor Dal
   - Toor Dal
   - Chana Dal

### Test 8: Quantity Slider
1. Select any food
2. Move slider from 0.5x to 5x
3. ✅ Should see:
   - Nutrition values multiply
   - Live calculation updates
   - Serving size changes

### Test 9: Recent Foods
1. Add a food
2. Open modal again
3. ✅ Should see "Recently Added" section

### Test 10: Mobile Responsive
1. Resize browser to mobile width
2. ✅ Should see:
   - Summary cards stack vertically
   - Modal fits screen
   - All features accessible

## Expected API Responses

### GET /api/diet/foods
```json
{
  "foods": [
    {
      "_id": "...",
      "name": "Wheat Roti",
      "category": "roti",
      "nutrition": {
        "calories": 71,
        "protein": 3,
        "carbs": 15,
        "fat": 0.4,
        "fiber": 2
      },
      "isPCOSFriendly": true,
      "isLowGI": true
    }
  ]
}
```

### GET /api/diet/summary
```json
{
  "totals": {
    "calories": 950,
    "protein": 45,
    "carbs": 120,
    "fat": 25,
    "fiber": 15
  },
  "targets": {
    "calories": 1800,
    "protein": 100,
    "carbs": 150,
    "fat": 60,
    "fiber": 25
  },
  "recommendations": [
    {
      "type": "protein",
      "message": "You're low on protein by 55g. Add paneer, dal, or sprouts.",
      "priority": "high"
    }
  ]
}
```

## Common Issues & Fixes

### Issue: "No foods found"
**Fix**: Run `node backend/seedFoods.js`

### Issue: "Failed to fetch foods"
**Fix**: Check backend is running on port 5000

### Issue: "Access token required"
**Fix**: Make sure you're logged in

### Issue: Modal not showing
**Fix**: Check browser console for errors

### Issue: Totals not updating
**Fix**: Refresh page, check API responses

## Performance Checks

✅ Modal opens instantly
✅ Search results appear < 100ms
✅ Food addition < 500ms
✅ Page navigation smooth
✅ No console errors
✅ Mobile responsive

## Browser Compatibility

✅ Chrome/Edge (Recommended)
✅ Firefox
✅ Safari
⚠️ IE11 (Not supported)

---

**All tests passing?** You're ready to track your PCOS-friendly diet! 🎉
