from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS
import base64
import os

# Import predictors
# Priority 1: Hugging Face model trained on real PCOS data
try:
    from huggingface_pcos_predictor import hf_predictor
    HUGGINGFACE_PCOS_AVAILABLE = True
    print("✅ Hugging Face PCOS model loaded (trained on real data)")
except Exception as e:
    print(f"⚠️  Warning: Hugging Face PCOS model not available: {e}")
    print("   Train it with: python train_huggingface_pcos.py")
    HUGGINGFACE_PCOS_AVAILABLE = False

try:
    from use_pretrained_model import detector as pretrained_detector
    PRETRAINED_AVAILABLE = True
    print("✅ Pre-trained PCOS detector loaded")
except Exception as e:
    print(f"⚠️  Warning: Pre-trained detector not available: {e}")
    PRETRAINED_AVAILABLE = False

try:
    from huggingface_analyzer import analyzer as hf_analyzer
    HUGGINGFACE_AVAILABLE = True
    print("✅ Hugging Face analyzer loaded")
except Exception as e:
    print(f"⚠️  Warning: Hugging Face analyzer not available: {e}")
    HUGGINGFACE_AVAILABLE = False

try:
    from ultrasound_predictor import predictor as ultrasound_predictor
    ULTRASOUND_MODEL_AVAILABLE = True
    print("✅ CNN ultrasound predictor loaded")
except Exception as e:
    print(f"⚠️  Warning: Ultrasound predictor not available: {e}")
    ULTRASOUND_MODEL_AVAILABLE = False

try:
    from image_analyzer import analyzer as cv_analyzer
    CV_ANALYZER_AVAILABLE = True
    print("✅ Computer vision analyzer loaded")
except Exception as e:
    print(f"⚠️  Warning: CV analyzer not available: {e}")
    CV_ANALYZER_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Load trained symptom-based model
try:
    with open('model/pcos_model.pkl', 'rb') as f:
        model = pickle.load(f)
    SYMPTOM_MODEL_AVAILABLE = True
except Exception as e:
    print(f"Warning: Symptom model not available: {e}")
    SYMPTOM_MODEL_AVAILABLE = False

@app.route('/')
def home():
    return "PCOS Prediction API is running."

@app.route('/predict', methods=['POST'])
def predict():
    """
    Symptom-based PCOS prediction
    """
    if not SYMPTOM_MODEL_AVAILABLE:
        return jsonify({'error': 'Symptom prediction model not available'}), 500
    
    try:
        data = request.get_json()
        print("Received data:", data)

        # Build DataFrame with same columns used in training
        input_df = pd.DataFrame([{
            'age (yrs)': float(data['age']),
            'bmi': float(data['bmi']),
            'hair growth(y/n)': int(data['hairGrowth']),
            'pimples(y/n)': int(data['acne']),
            'cycle(r/i)': int(data['irregularPeriods']),
        }])

        print("Input DF:\n", input_df)

        # Make prediction
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])

        return jsonify({
            'prediction': prediction,            # 0 = No PCOS, 1 = PCOS
            'probability': round(probability * 100, 2),  # percentage
            'method': 'Random Forest (Symptom-based)'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze ultrasound image for PCOS detection
    Tries multiple methods in order of accuracy:
    1. Hugging Face Vision AI (best, free API)
    2. CNN Deep Learning Model (good, local)
    3. Computer Vision Analysis (fallback)
    """
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Get base64 image data
        image_data = data['image']
        
        # Method 1: Try Hugging Face PCOS Model (Primary - Trained on Real Data)
        if HUGGINGFACE_PCOS_AVAILABLE:
            try:
                print("🤖 Attempting Hugging Face PCOS model (trained on your dataset)...")
                result = hf_predictor.predict(image_data)
                
                if result['success']:
                    print("✅ Hugging Face PCOS model successful")
                    return jsonify(result)
                else:
                    print(f"⚠️  Hugging Face PCOS model failed: {result.get('error', 'Unknown error')}")
                    # If it's not an ultrasound, return immediately
                    if not result.get('isUltrasound', True):
                        return jsonify(result), 400
            except Exception as e:
                print(f"❌ Hugging Face PCOS model error: {str(e)}")
        
        # Method 2: Try Pre-trained Detector (Secondary)
        if PRETRAINED_AVAILABLE:
            try:
                print("🎯 Attempting pre-trained PCOS detector...")
                result = pretrained_detector.analyze_ultrasound(image_data)
                
                if result['success']:
                    print("✅ Pre-trained detector successful")
                    return jsonify(result)
                else:
                    print(f"⚠️  Pre-trained detector failed: {result.get('error', 'Unknown error')}")
                    # If it's not an ultrasound, return immediately
                    if not result.get('isUltrasound', True):
                        return jsonify(result), 400
            except Exception as e:
                print(f"❌ Pre-trained detector error: {str(e)}")
        
        # Method 3: Try Hugging Face Vision AI (Tertiary - Free API)
        if HUGGINGFACE_AVAILABLE:
            try:
                print("🤗 Attempting Hugging Face Vision AI analysis...")
                result = hf_analyzer.analyze_ultrasound(image_data)
                
                if result['success']:
                    print("✅ Hugging Face analysis successful")
                    return jsonify(result)
                else:
                    print(f"⚠️  Hugging Face failed: {result.get('error', 'Unknown error')}")
                    # If it's not an ultrasound, return immediately
                    if not result.get('isUltrasound', True):
                        return jsonify(result), 400
            except Exception as e:
                print(f"❌ Hugging Face error: {str(e)}")
        
        # Method 2: Try CNN Deep Learning Model (Local)
        if ULTRASOUND_MODEL_AVAILABLE:
            try:
                print("🧠 Attempting CNN model prediction...")
                result = ultrasound_predictor.predict(image_data)
                
                if result['success']:
                    result['method'] = 'CNN Deep Learning Model'
                    print("✅ CNN model prediction successful")
                    return jsonify(result)
                else:
                    print(f"⚠️  CNN model failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ CNN model error: {str(e)}")
        
        # Method 3: Fallback to Computer Vision Analysis
        if CV_ANALYZER_AVAILABLE:
            try:
                print("👁️  Attempting CV analysis...")
                result = cv_analyzer.analyze_ultrasound(image_data)
                
                if result['success']:
                    result['method'] = 'Computer Vision Analysis'
                    print("✅ CV analysis successful")
                    return jsonify(result)
                else:
                    print(f"⚠️  CV analysis failed: {result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ CV analysis error: {str(e)}")
        
        # If all methods fail
        return jsonify({
            'success': False,
            'error': 'All image analysis methods failed',
            'details': 'Please ensure the image is a valid ultrasound image showing ovarian region',
            'availableMethods': {
                'huggingFacePCOS': HUGGINGFACE_PCOS_AVAILABLE,
                'pretrainedDetector': PRETRAINED_AVAILABLE,
                'huggingFace': HUGGINGFACE_AVAILABLE,
                'cnnModel': ULTRASOUND_MODEL_AVAILABLE,
                'cvAnalysis': CV_ANALYZER_AVAILABLE
            },
            'help': 'Train the Hugging Face PCOS model: python train_huggingface_pcos.py'
        }), 500
        
    except Exception as e:
        print(f"❌ Image analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Image analysis failed: {str(e)}'
        }), 500

@app.route('/model-status', methods=['GET'])
def model_status():
    """
    Check which models are available
    """
    status = {
        'huggingFacePCOS': HUGGINGFACE_PCOS_AVAILABLE,
        'pretrainedDetector': PRETRAINED_AVAILABLE,
        'huggingFace': HUGGINGFACE_AVAILABLE,
        'symptomModel': SYMPTOM_MODEL_AVAILABLE,
        'ultrasoundCNN': ULTRASOUND_MODEL_AVAILABLE,
        'cvAnalyzer': CV_ANALYZER_AVAILABLE
    }
    
    # Determine recommendation
    if HUGGINGFACE_PCOS_AVAILABLE:
        recommendation = '🎉 Hugging Face PCOS model operational (trained on real data) - BEST ACCURACY!'
    elif PRETRAINED_AVAILABLE:
        recommendation = '✅ Pre-trained PCOS detector operational'
    elif HUGGINGFACE_AVAILABLE:
        recommendation = '✅ Hugging Face AI operational'
    elif ULTRASOUND_MODEL_AVAILABLE:
        recommendation = '✅ Local CNN model operational'
    elif CV_ANALYZER_AVAILABLE:
        recommendation = '⚠️  Only basic CV available'
    else:
        recommendation = '❌ No image analysis available. Train model: python train_huggingface_pcos.py'
    
    status['recommendation'] = recommendation
    status['setup'] = 'Train Hugging Face model: python train_huggingface_pcos.py'
    
    return jsonify(status)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
