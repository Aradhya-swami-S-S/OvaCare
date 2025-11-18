# Groq AI PCOS Detection Setup Guide

## Overview
This integration uses Groq AI's vision model (llama-3.2-11b-vision-preview) to analyze ultrasound images for PCOS detection. The system validates that uploaded images are ultrasound images before performing medical analysis.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install groq-sdk multer dotenv axios
```

### 2. Configure Environment Variables
Add your Groq API key to `backend/.env`:
```env
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here
```

**To get your Groq API key:**
1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your .env file

### 3. Start Backend Server
```bash
cd backend
npm start
# or
npx nodemon app.js
```

## Frontend Setup

### 1. Install Dependencies (if needed)
```bash
cd frontend
npm install axios
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

## Features Implemented

### 🔍 Image Validation
- **Ultrasound Detection**: AI validates that uploaded images are ultrasound images
- **Medical Relevance**: Ensures images show ovarian/pelvic region suitable for PCOS analysis
- **Error Handling**: Clear error messages if non-ultrasound images are uploaded

### 🧠 AI Analysis
- **PCOS Detection**: Analyzes ultrasound images for PCOS indicators
- **Confidence Scoring**: Provides confidence levels (0-100%)
- **Detailed Findings**: Lists specific observations from the analysis
- **Medical Recommendations**: Provides relevant medical recommendations

### 🛡️ Security & Validation
- **Authentication Required**: Only authenticated users can access the analysis
- **File Type Validation**: Only image files accepted
- **File Size Limits**: Maximum 10MB file size
- **Error Handling**: Comprehensive error handling and user feedback

## API Endpoint

### POST `/analyze-ultrasound`
**Authentication**: Required (Bearer token)
**Content-Type**: multipart/form-data

**Request:**
```javascript
const formData = new FormData();
formData.append('image', file);

fetch('/analyze-ultrasound', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Success Response:**
```json
{
  "success": true,
  "isUltrasound": true,
  "analysis": {
    "pcosDetected": true,
    "confidence": 85,
    "findings": [
      "Multiple small follicles observed in peripheral arrangement",
      "Increased ovarian volume detected",
      "Enhanced stromal echogenicity present"
    ],
    "recommendations": [
      "Consult with gynecologist for comprehensive evaluation",
      "Consider hormonal assessment",
      "Discuss lifestyle modifications"
    ],
    "disclaimer": "This analysis is for informational purposes only and should not replace professional medical diagnosis."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (Non-Ultrasound Image):**
```json
{
  "error": "Please upload an ultrasound image only",
  "details": "This appears to be a regular photograph, not a medical ultrasound image",
  "isUltrasound": false
}
```

## User Experience Flow

1. **Upload Image**: User selects an image file
2. **Validation**: System validates file type and size
3. **AI Validation**: Groq AI confirms it's an ultrasound image
4. **Analysis**: If valid, AI analyzes for PCOS indicators
5. **Results**: Detailed analysis with findings and recommendations
6. **Actions**: Options to upload another image or view diet plans

## Error Handling

### Common Error Scenarios:
- **Non-ultrasound images**: "Please upload an ultrasound image only"
- **Invalid file types**: "Please select an image file"
- **File too large**: "File size must be less than 10MB"
- **Missing API key**: "AI service configuration error"
- **Network issues**: "Failed to analyze image. Please try again."

## Medical Disclaimer

The system includes appropriate medical disclaimers:
- Analysis is for informational purposes only
- Does not replace professional medical diagnosis
- Recommends consulting healthcare providers
- Conservative approach to medical recommendations

## Technical Details

### AI Model Used
- **Primary Model**: llama-3.2-90b-vision-preview (preferred)
- **Fallback Models**: llama-3.2-11b-vision-preview, llava-v1.5-7b-4096-preview
- **Provider**: Groq
- **Capabilities**: Vision analysis, medical image interpretation
- **Temperature**: 0.1 (for consistent, conservative results)
- **Auto-Detection**: System automatically detects and uses available vision models

### Image Processing
- **Format Support**: JPG, PNG, JPEG
- **Size Limit**: 10MB
- **Processing**: Base64 encoding for API transmission
- **Storage**: Images processed in memory, not stored permanently

### Performance
- **Analysis Time**: Typically 3-10 seconds
- **Accuracy**: Depends on image quality and clarity
- **Rate Limits**: Subject to Groq API rate limits

## Troubleshooting

### Common Issues:

1. **"Groq API key not configured"**
   - Check that GROQ_API_KEY is set in .env file
   - Restart the backend server after adding the key

2. **"AI vision service temporarily unavailable"**
   - This occurs when vision models are decommissioned or unavailable
   - The system automatically tries multiple models as fallbacks
   - Check `/debug/models` endpoint to see model availability
   - Wait and try again later, or contact support

3. **"Please upload an ultrasound image only"**
   - Ensure you're uploading actual ultrasound images
   - Images should show medical ultrasound characteristics

4. **"Failed to analyze image"**
   - Check internet connection
   - Verify Groq API key is valid
   - Try with a different image

5. **File upload errors**
   - Check file size (must be < 10MB)
   - Ensure file is an image format
   - Try refreshing the page

### Debug Endpoint
Access `/debug/models` (requires authentication) to check which vision models are currently available.

## Next Steps

Consider adding:
- **Image preprocessing** for better analysis
- **Multiple image analysis** for comprehensive assessment
- **Historical analysis tracking** for users
- **Integration with medical databases**
- **Batch processing** for multiple images
- **Export functionality** for analysis reports