"""
Test script to verify all PCOS detection models are working
"""

import os
import sys

def test_symptom_model():
    """Test symptom-based prediction model"""
    print("\n" + "="*60)
    print("Testing Symptom-Based Model")
    print("="*60)
    
    try:
        import pickle
        import pandas as pd
        
        # Load model
        with open('model/pcos_model.pkl', 'rb') as f:
            model = pickle.load(f)
        
        # Test prediction
        test_data = pd.DataFrame([{
            'age (yrs)': 25.0,
            'bmi': 28.0,
            'hair growth(y/n)': 1,
            'pimples(y/n)': 1,
            'cycle(r/i)': 1,
        }])
        
        prediction = model.predict(test_data)[0]
        probability = model.predict_proba(test_data)[0][1]
        
        print("✅ Symptom model loaded successfully")
        print(f"   Test prediction: {'PCOS' if prediction == 1 else 'Normal'}")
        print(f"   Probability: {probability*100:.2f}%")
        return True
        
    except Exception as e:
        print(f"❌ Symptom model failed: {str(e)}")
        return False

def test_cnn_model():
    """Test CNN ultrasound model"""
    print("\n" + "="*60)
    print("Testing CNN Ultrasound Model")
    print("="*60)
    
    try:
        from ultrasound_predictor import predictor
        import numpy as np
        from PIL import Image
        
        # Check if model is loaded
        if predictor.model is None:
            print("❌ CNN model not loaded")
            print("   Run: python train_ultrasound_model.py")
            return False
        
        # Create a test image
        test_img = Image.fromarray(
            np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        )
        
        # Test prediction
        result = predictor.predict(test_img)
        
        if result['success']:
            print("✅ CNN model loaded successfully")
            print(f"   Model version: {result['metrics']['modelVersion']}")
            print(f"   Input size: {result['metrics']['inputSize']}")
            print(f"   Test prediction: {'PCOS' if result['analysis']['pcosDetected'] else 'Normal'}")
            print(f"   Confidence: {result['analysis']['confidence']}%")
            return True
        else:
            print(f"❌ CNN model prediction failed: {result.get('error', 'Unknown error')}")
            return False
            
    except ImportError:
        print("❌ CNN model not available")
        print("   Install: pip install tensorflow keras")
        print("   Train: python train_ultrasound_model.py")
        return False
    except Exception as e:
        print(f"❌ CNN model failed: {str(e)}")
        return False

def test_cv_analyzer():
    """Test computer vision analyzer"""
    print("\n" + "="*60)
    print("Testing Computer Vision Analyzer")
    print("="*60)
    
    try:
        from image_analyzer import analyzer
        import numpy as np
        from PIL import Image
        import base64
        import io
        
        # Create a test image
        test_img = Image.fromarray(
            np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        )
        
        # Convert to base64
        buffered = io.BytesIO()
        test_img.save(buffered, format='PNG')
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Test analysis
        result = analyzer.analyze_ultrasound(f"data:image/png;base64,{img_str}")
        
        if result['success']:
            print("✅ CV analyzer loaded successfully")
            print(f"   Test prediction: {'PCOS' if result['analysis']['pcosDetected'] else 'Normal'}")
            print(f"   Confidence: {result['analysis']['confidence']}%")
            print(f"   Follicle count: {result['metrics']['follicleCount']}")
            return True
        else:
            print(f"❌ CV analyzer failed: {result.get('error', 'Unknown error')}")
            return False
            
    except ImportError as e:
        print(f"❌ CV analyzer not available: {str(e)}")
        print("   Install: pip install opencv-python Pillow")
        return False
    except Exception as e:
        print(f"❌ CV analyzer failed: {str(e)}")
        return False

def test_api_server():
    """Test if API server is running"""
    print("\n" + "="*60)
    print("Testing API Server")
    print("="*60)
    
    try:
        import requests
        
        response = requests.get('http://localhost:5001/', timeout=2)
        if response.status_code == 200:
            print("✅ API server is running")
            print(f"   Response: {response.text}")
            
            # Test model status endpoint
            status_response = requests.get('http://localhost:5001/model-status', timeout=2)
            if status_response.status_code == 200:
                status = status_response.json()
                print("\n   Model Status:")
                print(f"   - Symptom Model: {'✅' if status['symptomModel'] else '❌'}")
                print(f"   - CNN Model: {'✅' if status['ultrasoundCNN'] else '❌'}")
                print(f"   - CV Analyzer: {'✅' if status['cvAnalyzer'] else '❌'}")
            
            return True
        else:
            print(f"❌ API server returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ API server is not running")
        print("   Start it with: python app.py")
        return False
    except Exception as e:
        print(f"❌ API server test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("PCOS Detection Models Test Suite")
    print("="*60)
    
    results = {
        'Symptom Model': test_symptom_model(),
        'CNN Model': test_cnn_model(),
        'CV Analyzer': test_cv_analyzer(),
        'API Server': test_api_server()
    }
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:20s}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All systems operational!")
    elif passed >= 2:
        print("\n⚠️  Some systems need attention, but core functionality works")
    else:
        print("\n❌ Critical systems failing - please check setup")
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    
    if not results['Symptom Model']:
        print("- Train symptom model: python train_model.py")
    
    if not results['CNN Model']:
        print("- Install TensorFlow: pip install tensorflow keras")
        print("- Train CNN model: python train_ultrasound_model.py")
    
    if not results['CV Analyzer']:
        print("- Install OpenCV: pip install opencv-python Pillow")
    
    if not results['API Server']:
        print("- Start API server: python app.py")
    
    print()
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    sys.exit(main())
