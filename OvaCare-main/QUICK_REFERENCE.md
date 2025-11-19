# 🚀 Quick Reference - PCOS Detection

## One-Command Setup

```bash
cd pcos-ml-api && pip install -r requirements.txt && python train_ultrasound_model.py && python app.py
```

## Essential Commands

### Setup
```bash
cd pcos-ml-api
pip install -r requirements.txt          # Install dependencies
python train_ultrasound_model.py         # Train CNN model
python test_models.py                    # Test everything
```

### Run
```bash
python app.py                            # Start ML API (port 5001)
cd ../backend && npm start               # Start backend (port 3000)
cd ../frontend && npm run dev            # Start frontend (port 5173)
```

### Test
```bash
curl http://localhost:5001/model-status  # Check models
python test_models.py                    # Run test suite
```

## API Endpoints

### Ultrasound Analysis
```bash
POST http://localhost:5001/analyze-image
Body: {"image": "data:image/jpeg;base64,..."}
```

### Symptom Prediction
```bash
POST http://localhost:5001/predict
Body: {"age": 25, "bmi": 28, "hairGrowth": 1, "acne": 1, "irregularPeriods": 1}
```

### Model Status
```bash
GET http://localhost:5001/model-status
```

## File Locations

```
pcos-ml-api/
├── app.py                          # Main API
├── train_ultrasound_model.py       # Train CNN
├── ultrasound_predictor.py         # CNN predictor
├── image_analyzer.py               # CV analyzer
├── test_models.py                  # Test suite
└── model/
    ├── pcos_ultrasound_model.h5   # CNN model
    └── pcos_model.pkl              # Symptom model
```

## Detection Methods

| Method | Accuracy | Use Case | Setup |
|--------|----------|----------|-------|
| CNN Deep Learning | 80-90% | Ultrasound images | `train_ultrasound_model.py` |
| Computer Vision | 60-75% | Fallback | Automatic |
| Symptom-Based | 85-90% | No images needed | `train_model.py` |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Model not found | `python train_ultrasound_model.py` |
| Module not found | `pip install -r requirements.txt` |
| API not running | `python app.py` |
| Low accuracy | Use real ultrasound images |
| Out of memory | Reduce batch_size in training script |

## Quick Tests

### Test 1: Model Status
```bash
curl http://localhost:5001/model-status
# Should show all models as true
```

### Test 2: Symptom Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":25,"bmi":28,"hairGrowth":1,"acne":1,"irregularPeriods":1}'
```

### Test 3: Full Test Suite
```bash
python test_models.py
# Should show all tests passing
```

## Important Files

- **Setup Guide**: [WORKING_PCOS_DETECTION.md](WORKING_PCOS_DETECTION.md)
- **CNN Training**: [SETUP_CNN_MODEL.md](SETUP_CNN_MODEL.md)
- **Quick Start**: [QUICK_START_PCOS_DETECTION.md](QUICK_START_PCOS_DETECTION.md)
- **Main README**: [README.md](README.md)

## Dependencies

```
Core:
- Python 3.8+
- TensorFlow 2.15.0
- OpenCV 4.8.1
- Flask 3.0.0

Optional:
- Groq API key (for cloud AI)
```

## Success Checklist

- [ ] Dependencies installed
- [ ] CNN model trained
- [ ] Tests passing
- [ ] ML API running (port 5001)
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] Can upload images
- [ ] Getting predictions

## Support

1. Run: `python test_models.py`
2. Check: [WORKING_PCOS_DETECTION.md](WORKING_PCOS_DETECTION.md)
3. Issue: Open GitHub issue with test results

---

**TL;DR**: Run `setup.bat` (Windows) or `setup.sh` (Linux/Mac) in `pcos-ml-api/` folder, then `python app.py`. Done! 🎉
