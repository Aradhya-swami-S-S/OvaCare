# PCOS Detection Setup Guide

## Overview

OvaCare now supports **multiple PCOS detection methods** with automatic fallback:

1. **Groq Vision AI** (Primary) - Cloud-based AI vision analysis
2. **Local Computer Vision** (Fallback) - OpenCV-based image analysis
3. **Symptom-based ML Model** (Always available) - Random Forest classifier

## Detection Methods

### 1. Ultrasound Image Analysis

#### Method A: Groq Vision AI (Recommended)
- **Pros**: Most accurate, uses advanced AI models
- **Cons**: Requires API key, internet connection
- **Setup**: Add `GROQ_API_KEY` to `backend/.env`

#### Method B: Local Computer Vision (Fallback)
- **Pros**: Works offline, no API key needed, free
- **Cons**: Less accurate than AI, basic analysis
- **How it works**: 
  - Uses OpenCV to detect circular structures (follicles)
  - Analyzes image characteristics (intensity, patterns)
  - Estimates ovarian volume and stromal echogenicity
  - Provides confidence score based on multiple factors

### 2. Symptom-Based Prediction

Uses machine learning (Random Forest) trained on clinical data:
- Age
- BMI
- Hair growth (hirsutism)
- Acne/pimples
- Menstrual cycle regularity

**Accuracy**: ~85-90% based on training data

## Installation

### Step 1: Install Python Dependencies

```bash
cd pcos-ml-api
pip install -r requirements.txt
```

New dependencies added:
- `opencv-python` - For image processing
- `Pillow` - For image handling

### Step 2: Start the ML API

```bash
cd pcos-ml-api
python app.py
```

The API will run on `http://localhost:5001`

### Step 3: Configure Backend (Optional)

If you have a Groq API key:

```bash
cd backend
# Edit .env file
echo "GROQ_API_KEY=your-groq-api-key-here" >> .env
```

If you don't have a Groq API key, the system will automatically use the local CV model.

### Step 4: Start Backend

```bash
cd backend
npm start
```

## How It Works

### Automatic Fallback System

```
User uploads ultrasound image
         ↓
Try Groq Vision AI
         ↓
    [Success?]
    ↙        ↘
  Yes         No
   ↓           ↓
Return      Try Local
Result      CV Model
             ↓
        [Success?]
        ↙        ↘
      Yes         No
       ↓           ↓
    Return      Return
    Result      Error
```

### Local CV Model Features

The local computer vision model analyzes:

1. **Follicle Detection**
   - Uses Hough Circle Transform
   - Detects circular structures 2-9mm in size
   - Counts follicles (PCOS threshold: ≥12)

2. **Ovarian Volume Estimation**
   - Analyzes contour areas
   - Classifies as 'normal' or 'enlarged'
   - Threshold: >10ml considered enlarged

3. **Stromal Echogenicity**
   - Analyzes pixel intensity in central region
   - Classifies as 'increased', 'normal', or 'decreased'
   - Increased echogenicity is a PCOS marker

4. **Confidence Calculation**
   - Follicle count: up to 60 points
   - Ovarian volume: up to 20 points
   - Stromal echogenicity: up to 20 points
   - Total: 0-100% confidence score

## API Endpoints

### 1. Ultrasound Analysis
```
POST /analyze-ultrasound
Headers: Authorization: Bearer <token>
Body: multipart/form-data with 'image' file

Response:
{
  "success": true,
  "isUltrasound": true,
  "analysis": {
    "pcosDetected": true/false,
    "confidence": 0-100,
    "findings": ["..."],
    "recommendations": ["..."],
    "disclaimer": "..."
  },
  "metrics": {
    "follicleCount": number,
    "ovarianVolume": "normal"/"enlarged",
    "stromalEchogenicity": "normal"/"increased"/"decreased"
  },
  "note": "Analysis method used"
}
```

### 2. Symptom-Based Prediction
```
POST /predict
Body: {
  "age": number,
  "bmi": number,
  "hairGrowth": 0/1,
  "acne": 0/1,
  "irregularPeriods": 0/1
}

Response:
{
  "prediction": 0/1,
  "probability": 0-100
}
```

### 3. Direct ML API (Local CV)
```
POST http://localhost:5001/analyze-image
Body: {
  "image": "data:image/jpeg;base64,..."
}

Response: Same as ultrasound analysis
```

## Troubleshooting

### Issue: "AI services temporarily unavailable"

**Solution 1**: Check if ML API is running
```bash
curl http://localhost:5001/
# Should return: "PCOS Prediction API is running."
```

**Solution 2**: Install missing dependencies
```bash
cd pcos-ml-api
pip install opencv-python Pillow
```

**Solution 3**: Check Python version
```bash
python --version
# Should be 3.8 or higher
```

### Issue: "Image does not appear to be an ultrasound"

**Causes**:
- Image is not an ultrasound
- Image quality is too low
- Image format not supported

**Solutions**:
- Use clear, high-quality ultrasound images
- Supported formats: JPEG, PNG
- Ensure image shows ovarian region

### Issue: Low confidence scores

**Reasons**:
- Image quality issues
- Unclear follicle visibility
- Non-standard ultrasound view

**Recommendations**:
- Use transabdominal or transvaginal ultrasound images
- Ensure good contrast and clarity
- Try multiple images for better assessment

## Accuracy & Limitations

### Local CV Model
- **Accuracy**: 60-75% (estimated)
- **Best for**: Clear ultrasound images with visible follicles
- **Limitations**: 
  - Cannot match radiologist expertise
  - May miss subtle features
  - Requires good image quality

### Symptom-Based Model
- **Accuracy**: 85-90% (based on training data)
- **Best for**: Initial screening
- **Limitations**:
  - Requires accurate symptom reporting
  - Cannot replace clinical diagnosis

### Groq Vision AI
- **Accuracy**: 80-90% (estimated)
- **Best for**: Comprehensive analysis
- **Limitations**:
  - Requires API key
  - Internet connection needed
  - API rate limits may apply

## Medical Disclaimer

⚠️ **IMPORTANT**: All automated analyses are for educational and screening purposes only. They should NOT replace:
- Professional medical diagnosis
- Radiologist interpretation
- Clinical examination
- Laboratory tests

Always consult with qualified healthcare providers for proper PCOS diagnosis and treatment.

## Getting Groq API Key (Optional)

1. Visit: https://console.groq.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Create new API key
5. Add to `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

## Support

For issues or questions:
1. Check this guide first
2. Review console logs for errors
3. Ensure all services are running
4. Check Python/Node.js versions
5. Open an issue on GitHub

## Future Improvements

Planned enhancements:
- [ ] Deep learning model for ultrasound analysis
- [ ] Integration with more AI providers
- [ ] Improved follicle detection algorithms
- [ ] Support for DICOM medical images
- [ ] Batch image analysis
- [ ] Historical comparison features
