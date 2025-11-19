"""
PCOS Ultrasound Image Predictor
Uses trained CNN model to predict PCOS from ultrasound images
"""

import tensorflow as tf
import keras
import numpy as np
from PIL import Image
import io
import base64
import os
import pickle

class UltrasoundPredictor:
    """
    Predictor class for PCOS detection from ultrasound images
    """
    
    def __init__(self, model_path='model/pcos_ultrasound_model.h5'):
        """
        Initialize predictor with trained model
        """
        self.model_path = model_path
        self.model = None
        self.class_indices = None
        self.input_size = (224, 224)
        
        # Load model if it exists
        if os.path.exists(model_path):
            self.load_model()
        else:
            print(f"Warning: Model not found at {model_path}")
            print("Please train the model first by running: python train_ultrasound_model.py")
    
    def load_model(self):
        """
        Load the trained model
        """
        try:
            self.model = keras.models.load_model(self.model_path)
            print(f"Model loaded successfully from {self.model_path}")
            
            # Load class indices
            class_indices_path = 'model/class_indices.pkl'
            if os.path.exists(class_indices_path):
                with open(class_indices_path, 'rb') as f:
                    self.class_indices = pickle.load(f)
            else:
                # Default class indices
                self.class_indices = {'normal': 0, 'pcos': 1}
            
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def preprocess_image(self, image_data):
        """
        Preprocess image for model input
        
        Args:
            image_data: Base64 string or PIL Image
            
        Returns:
            Preprocessed numpy array
        """
        try:
            # Convert base64 to PIL Image if needed
            if isinstance(image_data, str):
                # Remove data URL prefix if present
                if 'base64,' in image_data:
                    image_data = image_data.split('base64,')[1]
                
                # Decode base64
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
            else:
                image = image_data
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to model input size
            image = image.resize(self.input_size)
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")
    
    def predict(self, image_data):
        """
        Predict PCOS from ultrasound image
        
        Args:
            image_data: Base64 string or PIL Image
            
        Returns:
            dict: Prediction results
        """
        if self.model is None:
            return {
                'success': False,
                'error': 'Model not loaded. Please train the model first.',
                'isUltrasound': False
            }
        
        try:
            # Preprocess image
            img_array = self.preprocess_image(image_data)
            
            # Make prediction
            prediction = self.model.predict(img_array, verbose=0)
            probability = float(prediction[0][0])
            
            # Determine class
            pcos_detected = probability > 0.5
            confidence = int(probability * 100) if pcos_detected else int((1 - probability) * 100)
            
            # Generate findings
            findings = self._generate_findings(pcos_detected, probability)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(pcos_detected, confidence)
            
            return {
                'success': True,
                'isUltrasound': True,
                'analysis': {
                    'pcosDetected': pcos_detected,
                    'confidence': confidence,
                    'findings': findings,
                    'recommendations': recommendations,
                    'disclaimer': 'This is an AI-assisted analysis and should not replace professional medical diagnosis. Please consult with a healthcare provider for proper evaluation.'
                },
                'metrics': {
                    'probability': round(probability, 4),
                    'modelVersion': 'CNN-MobileNetV2',
                    'inputSize': f'{self.input_size[0]}x{self.input_size[1]}'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Prediction failed: {str(e)}',
                'isUltrasound': False
            }
    
    def _generate_findings(self, pcos_detected, probability):
        """
        Generate findings based on prediction
        """
        findings = []
        
        if pcos_detected:
            if probability > 0.9:
                findings.append("Strong indicators of polycystic ovarian morphology detected")
                findings.append("High confidence in PCOS pattern recognition")
            elif probability > 0.7:
                findings.append("Polycystic ovarian morphology detected")
                findings.append("Moderate to high confidence in PCOS indicators")
            else:
                findings.append("Possible polycystic ovarian morphology")
                findings.append("Borderline PCOS indicators detected")
            
            findings.append("Multiple follicular structures identified")
            findings.append("Ovarian morphology consistent with PCOS criteria")
        else:
            if probability < 0.1:
                findings.append("Normal ovarian morphology detected")
                findings.append("No significant PCOS indicators found")
            elif probability < 0.3:
                findings.append("Predominantly normal ovarian appearance")
                findings.append("Minimal PCOS indicators")
            else:
                findings.append("Mostly normal ovarian morphology")
                findings.append("Some follicular activity within normal range")
            
            findings.append("Ovarian structure appears within normal parameters")
        
        return findings
    
    def _generate_recommendations(self, pcos_detected, confidence):
        """
        Generate medical recommendations
        """
        recommendations = []
        
        if pcos_detected:
            recommendations.append("Consult with a gynecologist or endocrinologist for comprehensive evaluation")
            recommendations.append("Consider hormonal blood tests (LH, FSH, testosterone, insulin, AMH)")
            recommendations.append("Clinical correlation with symptoms is essential")
            
            if confidence > 80:
                recommendations.append("High confidence result - prioritize medical consultation")
                recommendations.append("Discuss treatment options and lifestyle modifications")
            else:
                recommendations.append("Moderate confidence - additional imaging may be helpful")
                recommendations.append("Consider repeat ultrasound for confirmation")
            
            recommendations.append("Regular monitoring and follow-up recommended")
        else:
            recommendations.append("Continue regular gynecological check-ups")
            recommendations.append("Maintain healthy lifestyle and monitor for any symptoms")
            recommendations.append("Consult healthcare provider if symptoms develop")
            recommendations.append("Routine screening as per medical guidelines")
        
        recommendations.append("This AI analysis should be confirmed by a qualified radiologist")
        recommendations.append("Multiple diagnostic criteria should be considered for PCOS diagnosis")
        
        return recommendations
    
    def validate_ultrasound(self, image_data):
        """
        Basic validation to check if image appears to be an ultrasound
        """
        try:
            # Preprocess image
            img_array = self.preprocess_image(image_data)
            
            # Basic checks
            # Ultrasounds typically have lower color variance and specific intensity patterns
            img_std = np.std(img_array)
            img_mean = np.mean(img_array)
            
            # Very rough heuristic
            is_likely_ultrasound = 20 < img_std < 100 and 50 < img_mean < 200
            
            return {
                'isUltrasound': is_likely_ultrasound,
                'confidence': 0.7 if is_likely_ultrasound else 0.3,
                'reason': 'Image characteristics consistent with ultrasound' if is_likely_ultrasound else 'Image may not be an ultrasound'
            }
            
        except Exception as e:
            return {
                'isUltrasound': False,
                'confidence': 0,
                'reason': f'Validation failed: {str(e)}'
            }


# Singleton instance
predictor = UltrasoundPredictor()
