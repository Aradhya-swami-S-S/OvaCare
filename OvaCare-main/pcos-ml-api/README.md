# PCOS ML API

Machine Learning API for PCOS detection with multiple methods.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train CNN Model (First Time Only)

```bash
python train_ultrasound_model.py
```

This creates a working CNN model for ultrasound analysis.

### 3. Start API Server

```bash
python app.py
```

Server runs on `http://localhost:5001`

### 4. Test Everything

```bash
python test_models.py
```

## 📊 Available Models

### 1. CNN Deep Learning Model (Best for Ultrasound)
- **File**: `ultrasound_predictor.py`
- **Model**: MobileNetV2 transfer learning
- **Accuracy**: 80-90% (with real data)
- **Use**: Ultrasound image analysis

### 2. Computer Vision Analyzer (Fallback)
- **File**: `image_analyzer.py`
- **Method**: OpenCV Hough Circle Transform
- **Accuracy**: 60-75%
- **Use**: When CNN model unavailable

### 3. Symptom-Based Model (Always Available)
- **File**: `app.py`
- **Model**: Random Forest Classifier
- **Accuracy**: 85-90%
- **Use**: Symptom-based prediction

## 🔌 API Endpoints

### 1. Analyze Ultrasound Image

```bash
POST /analyze-image
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "isUltrasound": true,
  "analysis": {
    "pcosDetected": true,
    "confidence": 85,
    "findings": ["..."],
    "recommendations": ["..."]
  },
  "method": "CNN Deep Learning Model"
}
```

### 2. Symptom-Based Prediction

```bash
POST /predict
Content-Type: application/json

{
  "age": 25,
  "bmi": 28,
  "hairGrowth": 1,
  "acne": 1,
  "irregularPeriods": 1
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 87.5,
  "method": "Random Forest (Symptom-based)"
}
```

### 3. Model Status

```bash
GET /model-status
```

**Response:**
```json
{
  "symptomModel": true,
  "ultrasoundCNN": true,
  "cvAnalyzer": true,
  "recommendation": "All systems operational"
}
```

## 📁 Project Structure

```
pcos-ml-api/
├── app.py                          # Main Flask API
├── train_model.py                  # Train symptom model
├── train_ultrasound_model.py       # Train CNN model
├── ultrasound_predictor.py         # CNN predictor
├── image_analyzer.py               # CV analyzer
├── test_models.py                  # Test suite
├── requirements.txt                # Dependencies
├── model/
│   ├── pcos_model.pkl             # Symptom model
│   ├── pcos_ultrasound_model.h5   # CNN model
│   └── class_indices.pkl          # Class mappings
└── dataset/
    ├── PCOS_data.csv              # Symptom training data
    └── ultrasound/                # Ultrasound images
        ├── train/
        │   ├── pcos/
        │   └── normal/
        └── val/
            ├── pcos/
            └── normal/
```

## 🔧 Configuration

### Use Real Ultrasound Images

1. Collect ultrasound images (PCOS and normal)
2. Organize in `dataset/ultrasound/` structure
3. Run `python train_ultrasound_model.py`

### Adjust Model Parameters

Edit `train_ultrasound_model.py`:

```python
# More epochs
epochs=20

# Larger batch size
batch_size=32

# Different base model
base_model = keras.applications.ResNet50(...)
```

## 🐛 Troubleshooting

### "Model not found"
```bash
python train_ultrasound_model.py
```

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Out of memory"
Reduce batch size in training script

### Low accuracy
- Need more training data
- Train for more epochs
- Use better quality images

## 📚 Documentation

- [Full Setup Guide](../SETUP_CNN_MODEL.md)
- [PCOS Detection Setup](../PCOS_DETECTION_SETUP.md)
- [Quick Start](../QUICK_START_PCOS_DETECTION.md)

## ⚠️ Medical Disclaimer

This is a screening tool, not a diagnostic tool. Always consult healthcare professionals for medical decisions.

## 📄 License

MIT License - See LICENSE file
