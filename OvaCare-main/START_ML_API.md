# Start ML API - Quick Guide

## ✅ System is Now Using Local ML Models Only

Groq API dependency has been **completely removed**. The system now uses:
1. **CNN Deep Learning Model** (Primary)
2. **Computer Vision Analyzer** (Fallback)
3. **Symptom-Based Model** (Always available)

## 🚀 Start the ML API

### Option 1: Quick Start

```bash
cd pcos-ml-api
python app.py
```

### Option 2: With Virtual Environment (Recommended)

```bash
cd pcos-ml-api

# Create virtual environment (first time only)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Train model (first time only)
python train_ultrasound_model.py

# Start API
python app.py
```

## ✅ Verify It's Running

Open another terminal and run:

```bash
curl http://localhost:5001/
```

Should return: `"PCOS Prediction API is running."`

Or check model status:

```bash
curl http://localhost:5001/model-status
```

Should return:
```json
{
  "symptomModel": true,
  "ultrasoundCNN": true,
  "cvAnalyzer": true,
  "recommendation": "All systems operational"
}
```

## 🧪 Test the System

### Test 1: Symptom Prediction

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d "{\"age\":25,\"bmi\":28,\"hairGrowth\":1,\"acne\":1,\"irregularPeriods\":1}"
```

### Test 2: Run Full Test Suite

```bash
cd pcos-ml-api
python test_models.py
```

## 🎯 Now Start Your Application

Once ML API is running on port 5001:

### Terminal 1: ML API (Already running)
```bash
cd pcos-ml-api
python app.py
```

### Terminal 2: Backend
```bash
cd backend
npm start
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **ML API**: http://localhost:5001

## 🐛 Troubleshooting

### Error: "Module not found"

```bash
cd pcos-ml-api
pip install -r requirements.txt
```

### Error: "Model not found"

```bash
cd pcos-ml-api
python train_ultrasound_model.py
```

### Error: "Port 5001 already in use"

```bash
# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5001 | xargs kill -9
```

### Error: "Connection refused"

Make sure ML API is running:
```bash
cd pcos-ml-api
python app.py
```

## 📊 What Happens When You Upload an Image

1. Frontend sends image to Backend (`/analyze-ultrasound`)
2. Backend converts image to base64
3. Backend sends to ML API (`http://localhost:5001/analyze-image`)
4. ML API tries methods in order:
   - CNN Model (best accuracy)
   - Computer Vision (fallback)
5. ML API returns results
6. Backend sends results to Frontend
7. Frontend displays analysis

## ✅ Success Indicators

When ML API starts successfully, you should see:

```
Model loaded successfully from model/pcos_ultrasound_model.h5
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5001
Press CTRL+C to quit
```

## 🎉 You're Ready!

- ✅ No Groq API needed
- ✅ Works completely offline
- ✅ Uses local ML models
- ✅ Multiple fallback options
- ✅ Fast and reliable

Upload an ultrasound image through your frontend and see the results!

---

**Need help?** Run `python test_models.py` to diagnose issues.
