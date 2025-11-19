# 🚀 QUICK REFERENCE - Hugging Face PCOS Detection

## ⚡ ONE COMMAND FIX

```bash
cd pcos-ml-api && python quick_train.py
```

---

## 📋 COMMAND CHEAT SHEET

```bash
# Install dependencies
pip install -r requirements_huggingface.txt

# Train model (10-20 min)
python train_huggingface_pcos.py

# Test accuracy (1 min)
python test_accuracy.py

# Start ML API
python app.py

# Check model status
curl http://localhost:5001/model-status
```

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `quick_train.py` | ⭐ One-command setup |
| `train_huggingface_pcos.py` | Main training script |
| `huggingface_pcos_predictor.py` | Predictor |
| `test_accuracy.py` | Test accuracy |
| `app.py` | ML API |
| `requirements_huggingface.txt` | Dependencies |

---

## 📚 DOCUMENTATION

| File | Content |
|------|---------|
| `START_HERE.md` | Quick start |
| `COMPLETE_SOLUTION.md` | Full solution |
| `HUGGINGFACE_PCOS_SOLUTION.md` | Detailed guide |
| `TRAIN_HUGGINGFACE_PCOS.md` | Training guide |
| `QUICK_REFERENCE_HUGGINGFACE.md` | This file |

---

## ✅ SUCCESS CHECKLIST

- [ ] Training completed (>85% accuracy)
- [ ] Model files exist (`model/huggingface_pcos/`)
- [ ] Test shows different results
- [ ] ML API loads HF model
- [ ] PCOS images detected correctly
- [ ] Normal images detected correctly
- [ ] Confidence varies (70-95%)

---

## 🎯 EXPECTED RESULTS

### PCOS Image
```
pcosDetected: true
confidence: 92%
pcosProbability: 92.3%
normalProbability: 7.7%
```

### Normal Image
```
pcosDetected: false
confidence: 88%
pcosProbability: 11.5%
normalProbability: 88.5%
```

---

## 🐛 QUICK FIXES

| Problem | Solution |
|---------|----------|
| Dataset not found | Check `PCOS (1)/PCOS/` exists |
| Out of memory | Reduce batch size to 8 |
| Model not loading | Retrain model |
| Low accuracy | Train for more epochs |
| Same results | Check model loaded |

---

## 📊 PERFORMANCE

- **Accuracy**: 85-95%
- **Training Time**: 10-20 min
- **Prediction Time**: 0.5-2 sec
- **Dataset**: 1000+ images

---

## 🚀 FULL SYSTEM START

```bash
# Terminal 1: ML API
cd pcos-ml-api && python app.py

# Terminal 2: Backend
cd backend && npm start

# Terminal 3: Frontend
cd frontend && npm run dev
```

---

## 🎉 DONE!

Open http://localhost:5173 and test!
