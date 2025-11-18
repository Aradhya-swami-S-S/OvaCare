# Period Tracker - Setup Guide

## ✅ What's Been Implemented

### Backend (Complete)
- ✅ Period & PeriodNote MongoDB models
- ✅ All API endpoints for tracking cycles
- ✅ Reminder system (3-day advance + on-day)
- ✅ Cycle calculation (30-day default, average after 3+ cycles)
- ✅ Note management (symptoms, medications, custom notes)

### Frontend (Complete)
- ✅ Main PeriodTracker component
- ✅ Visual calendar with cycle highlighting
- ✅ Cycle timeline with expandable notes
- ✅ Add Note modal (cramps, flow, mood, pain, meds)
- ✅ Set Tracker modal (date picker)
- ✅ Reset Tracker modal (with confirmation)
- ✅ Reminder notifications
- ✅ Updated navbar ("Period Tracker" instead of "Tracker")

## 🚀 How to Test

### 1. Start Backend
```bash
cd backend
npm install
npx nodemon app.js
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test the Features

**First Time Setup:**
1. Login to your account
2. Click "Period Tracker" in navbar
3. Click "Set Tracker" button
4. Select your last period start date
5. Click "Set Tracker"

**Add Notes:**
1. Click "Add Note" button
2. Fill in symptoms (cramps, flow, mood, pain)
3. Add medications if needed
4. Add custom notes
5. Click "Save Note"

**View History:**
- Scroll down to see "Cycle History"
- Click on any past cycle to expand and see notes
- Calendar shows period days in red, predicted in purple

**Reset Tracker:**
1. Click "Reset Tracker" button
2. Check the confirmation box
3. Click "Reset Tracker" to clear all data

## 📋 Features Overview

### Current Cycle Display
- Shows current cycle day
- Days until next period
- Average cycle length

### Calendar View
- Visual calendar with color-coded days
- Red = Period days
- Purple = Predicted period
- Purple ring = Today

### Cycle Timeline
- List of past cycles
- Expandable to show all notes
- Symptom icons and details

### Reminders
- 3-day advance warning
- On-day reminder
- Dismissible notifications

### Notes System
- Cramps: none/mild/moderate/severe
- Flow: spotting/light/medium/heavy
- Mood: happy/neutral/sad/irritable/anxious
- Pain: 0-10 scale
- Medications: name, dosage, time
- Custom notes: up to 1000 characters

## 🎨 UI Updates

- ✅ All "Symptom Tracker" → "Period Tracker"
- ✅ Calendar icon (not pink teardrops)
- ✅ Purple theme consistent with app
- ✅ Mobile-responsive design

## 📊 How It Works

### Cycle Prediction
1. **First cycle**: Uses 30-day default
2. **After 3+ cycles**: Uses your average cycle length
3. **Reminders**: Automatically calculated based on predicted date

### Data Storage
- All data is user-specific and private
- Stored in MongoDB with authentication required
- Can be reset at any time

## 🔧 API Endpoints

All endpoints require authentication (Bearer token):

- `GET /api/period/cycles` - Get all cycle data
- `POST /api/period/start` - Log new period
- `POST /api/period/end` - End current period
- `PUT /api/period/update/:periodId` - Update period
- `DELETE /api/period/reset` - Reset all data
- `GET /api/period/notes/:periodId` - Get notes for cycle
- `POST /api/period/notes` - Add new note
- `PUT /api/period/notes/:noteId` - Update note
- `DELETE /api/period/notes/:noteId` - Delete note
- `GET /api/period/reminders` - Get pending reminders
- `POST /api/period/reminders/dismiss` - Dismiss reminder

## ✨ That's It!

The Period Tracker is now fully functional and ready to use. All the old "Symptom Tracker" references have been replaced with "Period Tracker" throughout the app.

Enjoy tracking! 🌸