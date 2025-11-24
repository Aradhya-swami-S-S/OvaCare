# ultrasound_predictor.py  (REPLACEMENT)
"""
Robust PCOS Ultrasound Image Predictor
Handles single-input and multi-input Keras models, binary and multi-class outputs.
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import base64
import os
import pickle
import traceback

class UltrasoundPredictor:
    def __init__(self, model_path='model/pcos_ultrasound_model.h5'):
        self.model_path = model_path
        self.model = None
        self.class_indices = None
        self.input_size = (224, 224)
        self._load_success = False

        if os.path.exists(model_path):
            self._load_success = self.load_model()
        else:
            print(f"Warning: Model not found at {model_path}")

    def load_model(self):
        try:
            # Use keras.models.load_model (works for HDF5 and saved_model)
            self.model = keras.models.load_model(self.model_path, compile=False)
            print(f"Model loaded successfully from {self.model_path}")

            # Try to load class indices
            class_indices_path = 'model/class_indices.pkl'
            if os.path.exists(class_indices_path):
                with open(class_indices_path, 'rb') as f:
                    self.class_indices = pickle.load(f)
            else:
                # sensible default for binary classification
                self.class_indices = {'normal': 0, 'pcos': 1}

            # print some helpful model info
            try:
                print("Model inputs:", [inp.shape for inp in self.model.inputs])
                print("Model outputs:", [out.shape for out in self.model.outputs])
            except Exception:
                pass

            return True
        except Exception as e:
            print("Error loading model:", str(e))
            traceback.print_exc()
            return False

    def model_summary_text(self):
        if self.model is None:
            return "No model loaded"
        summary = []
        self.model.summary(print_fn=lambda s: summary.append(s))
        return "\n".join(summary)

    def preprocess_image(self, image_data):
        try:
            # Accept base64 string or PIL Image
            if isinstance(image_data, str):
                if 'base64,' in image_data:
                    image_data = image_data.split('base64,')[1]
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
            elif isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data))
            else:
                image = image_data

            # Ensure RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')

            image = image.resize(self.input_size)
            arr = np.array(image).astype('float32') / 255.0  # normalize
            arr = np.expand_dims(arr, axis=0)  # batch dim
            return arr
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {e}")

    def _prepare_inputs_for_model(self, img_array):
        """
        If model expects multiple inputs, return a list of identical inputs.
        If single input, return that array.
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")

        # If model.inputs is a list of multiple inputs
        try:
            inputs = self.model.inputs
            if isinstance(inputs, (list, tuple)) and len(inputs) > 1:
                # create list of identical arrays for each input
                return [img_array for _ in inputs]
            else:
                return img_array
        except Exception:
            # Fallback: return img_array
            return img_array

    def _interpret_output(self, raw_pred):
        """
        Interpret model output robustly:
        - handles single sigmoid output: shape (1,1)
        - handles multi-class softmax: shape (1, n)
        - returns (probability_of_pcos, is_pcos, confidence_int)
        """
        try:
            arr = np.asarray(raw_pred)
            # If model returns list (multiple outputs), pick the first
            if isinstance(raw_pred, list):
                arr = np.asarray(raw_pred[0])

            # Flatten to 1-D per sample
            if arr.ndim == 2 and arr.shape[1] == 1:
                # binary sigmoid
                prob = float(arr[0][0])
                is_pcos = prob > 0.5
                confidence = int(prob * 100) if is_pcos else int((1 - prob) * 100)
                return prob, bool(is_pcos), confidence

            elif arr.ndim == 2 and arr.shape[1] >= 2:
                # multi-class softmax -> assume 'pcos' is class index 1 if default mapping
                probs = arr[0]
                predicted_idx = int(np.argmax(probs))
                prob = float(probs[predicted_idx])
                # determine pcos index
                pcos_idx = None
                # try to deduce from class_indices
                if isinstance(self.class_indices, dict):
                    for k, v in self.class_indices.items():
                        if str(k).lower().startswith('pcos') or 'pcos' in str(k).lower():
                            pcos_idx = int(v)
                            break
                    if pcos_idx is None:
                        # fallback: assume last index indicates 'pcos'
                        pcos_idx = 1 if probs.shape[0] > 1 else 0

                is_pcos = (predicted_idx == pcos_idx)
                # If predicted_idx != pcos_idx, probability of pcos is probs[pcos_idx]
                pcos_prob = float(probs[pcos_idx]) if pcos_idx < len(probs) else float(prob)
                confidence = int(pcos_prob * 100) if pcos_prob >= 0.5 else int((1 - pcos_prob) * 100)
                return pcos_prob, bool(pcos_prob >= 0.5), confidence

            else:
                # Unexpected shape
                prob = float(np.squeeze(arr))
                is_pcos = prob > 0.5
                confidence = int(prob * 100) if is_pcos else int((1 - prob) * 100)
                return prob, bool(is_pcos), confidence

        except Exception as e:
            raise RuntimeError(f"Error interpreting model output: {e}")

    def _generate_findings(self, pcos_detected, prob):
        findings = []
        if pcos_detected:
            if prob > 0.9:
                findings.append("Strong indicators of polycystic ovarian morphology detected")
            elif prob > 0.7:
                findings.append("Polycystic ovarian morphology detected")
            else:
                findings.append("Possible polycystic ovarian morphology")
            findings.append("Multiple follicular structures identified")
        else:
            findings.append("Ovarian morphology appears within normal parameters")
        return findings

    def _generate_recommendations(self, pcos_detected, confidence):
        recommendations = []
        if pcos_detected:
            recommendations.append("Consult a gynecologist or endocrinologist")
            if confidence > 80:
                recommendations.append("High confidence result - prioritize medical consultation")
        else:
            recommendations.append("Continue routine gynecological follow-ups")
        recommendations.append("AI analysis is not a diagnosis")
        return recommendations

    def predict(self, image_data):
        if not self._load_success:
            return {'success': False, 'error': 'Model not loaded', 'isUltrasound': False}

        try:
            img = self.preprocess_image(image_data)
            model_input = self._prepare_inputs_for_model(img)

            # Call model.predict with proper inputs
            raw_pred = None
            if isinstance(model_input, list):
                raw_pred = self.model.predict(model_input, verbose=0)
            else:
                raw_pred = self.model.predict(model_input, verbose=0)

            # Interpret predictions
            prob, is_pcos, confidence = self._interpret_output(raw_pred)

            findings = self._generate_findings(is_pcos, prob)
            recs = self._generate_recommendations(is_pcos, confidence)

            return {
                'success': True,
                'isUltrasound': True,
                'analysis': {
                    'pcosDetected': bool(is_pcos),
                    'confidence': confidence,
                    'findings': findings,
                    'recommendations': recs,
                    'disclaimer': 'AI-assisted only; consult a doctor.'
                },
                'metrics': {
                    'probability': round(prob, 4),
                    'modelVersion': getattr(self.model, 'name', 'unknown'),
                    'inputSize': f'{self.input_size[0]}x{self.input_size[1]}'
                }
            }

        except Exception as e:
            tb = traceback.format_exc()
            return {'success': False, 'error': f'Prediction failed: {e}', 'traceback': tb, 'isUltrasound': False}


# Singleton instance for import
predictor = UltrasoundPredictor()




# """
# PCOS Ultrasound Image Predictor
# Uses trained CNN model to predict PCOS from ultrasound images
# """

# import tensorflow as tf
# import keras
# import numpy as np
# from PIL import Image
# import io
# import base64
# import os
# import pickle

# class UltrasoundPredictor:
#     """
#     Predictor class for PCOS detection from ultrasound images
#     """
    
#     def __init__(self, model_path='model/pcos_ultrasound_model.h5'):
#         """
#         Initialize predictor with trained model
#         """
#         self.model_path = model_path
#         self.model = None
#         self.class_indices = None
#         self.input_size = (224, 224)
        
#         # Load model if it exists
#         if os.path.exists(model_path):
#             self.load_model()
#         else:
#             print(f"Warning: Model not found at {model_path}")
#             print("Please train the model first by running: python train_ultrasound_model.py")
    
#     def load_model(self):
#         """
#         Load the trained model
#         """
#         try:
#             self.model = keras.models.load_model(self.model_path)
#             print(f"Model loaded successfully from {self.model_path}")
            
#             # Load class indices
#             class_indices_path = 'model/class_indices.pkl'
#             if os.path.exists(class_indices_path):
#                 with open(class_indices_path, 'rb') as f:
#                     self.class_indices = pickle.load(f)
#             else:
#                 # Default class indices
#                 self.class_indices = {'normal': 0, 'pcos': 1}
            
#             return True
#         except Exception as e:
#             print(f"Error loading model: {str(e)}")
#             return False
    
#     def preprocess_image(self, image_data):
#         """
#         Preprocess image for model input
        
#         Args:
#             image_data: Base64 string or PIL Image
            
#         Returns:
#             Preprocessed numpy array
#         """
#         try:
#             # Convert base64 to PIL Image if needed
#             if isinstance(image_data, str):
#                 # Remove data URL prefix if present
#                 if 'base64,' in image_data:
#                     image_data = image_data.split('base64,')[1]
                
#                 # Decode base64
#                 image_bytes = base64.b64decode(image_data)
#                 image = Image.open(io.BytesIO(image_bytes))
#             else:
#                 image = image_data
            
#             # Convert to RGB if needed
#             if image.mode != 'RGB':
#                 image = image.convert('RGB')
            
#             # Resize to model input size
#             image = image.resize(self.input_size)
            
#             # Convert to numpy array
#             img_array = np.array(image)
            
#             # Add batch dimension
#             img_array = np.expand_dims(img_array, axis=0)
            
#             return img_array
            
#         except Exception as e:
#             raise ValueError(f"Error preprocessing image: {str(e)}")
    
#     def predict(self, image_data):
#         """
#         Predict PCOS from ultrasound image
        
#         Args:
#             image_data: Base64 string or PIL Image
            
#         Returns:
#             dict: Prediction results
#         """
#         if self.model is None:
#             return {
#                 'success': False,
#                 'error': 'Model not loaded. Please train the model first.',
#                 'isUltrasound': False
#             }
        
#         try:
#             # Preprocess image
#             img_array = self.preprocess_image(image_data)
            
#             # Make prediction
#             prediction = self.model.predict(img_array, verbose=0)
#             probability = float(prediction[0][0])
            
#             # Determine class
#             pcos_detected = probability > 0.5
#             confidence = int(probability * 100) if pcos_detected else int((1 - probability) * 100)
            
#             # Generate findings
#             findings = self._generate_findings(pcos_detected, probability)
            
#             # Generate recommendations
#             recommendations = self._generate_recommendations(pcos_detected, confidence)
            
#             return {
#                 'success': True,
#                 'isUltrasound': True,
#                 'analysis': {
#                     'pcosDetected': pcos_detected,
#                     'confidence': confidence,
#                     'findings': findings,
#                     'recommendations': recommendations,
#                     'disclaimer': 'This is an AI-assisted analysis and should not replace professional medical diagnosis. Please consult with a healthcare provider for proper evaluation.'
#                 },
#                 'metrics': {
#                     'probability': round(probability, 4),
#                     'modelVersion': 'CNN-MobileNetV2',
#                     'inputSize': f'{self.input_size[0]}x{self.input_size[1]}'
#                 }
#             }
            
#         except Exception as e:
#             return {
#                 'success': False,
#                 'error': f'Prediction failed: {str(e)}',
#                 'isUltrasound': False
#             }
    
#     def _generate_findings(self, pcos_detected, probability):
#         """
#         Generate findings based on prediction
#         """
#         findings = []
        
#         if pcos_detected:
#             if probability > 0.9:
#                 findings.append("Strong indicators of polycystic ovarian morphology detected")
#                 findings.append("High confidence in PCOS pattern recognition")
#             elif probability > 0.7:
#                 findings.append("Polycystic ovarian morphology detected")
#                 findings.append("Moderate to high confidence in PCOS indicators")
#             else:
#                 findings.append("Possible polycystic ovarian morphology")
#                 findings.append("Borderline PCOS indicators detected")
            
#             findings.append("Multiple follicular structures identified")
#             findings.append("Ovarian morphology consistent with PCOS criteria")
#         else:
#             if probability < 0.1:
#                 findings.append("Normal ovarian morphology detected")
#                 findings.append("No significant PCOS indicators found")
#             elif probability < 0.3:
#                 findings.append("Predominantly normal ovarian appearance")
#                 findings.append("Minimal PCOS indicators")
#             else:
#                 findings.append("Mostly normal ovarian morphology")
#                 findings.append("Some follicular activity within normal range")
            
#             findings.append("Ovarian structure appears within normal parameters")
        
#         return findings
    
#     def _generate_recommendations(self, pcos_detected, confidence):
#         """
#         Generate medical recommendations
#         """
#         recommendations = []
        
#         if pcos_detected:
#             recommendations.append("Consult with a gynecologist or endocrinologist for comprehensive evaluation")
#             recommendations.append("Consider hormonal blood tests (LH, FSH, testosterone, insulin, AMH)")
#             recommendations.append("Clinical correlation with symptoms is essential")
            
#             if confidence > 80:
#                 recommendations.append("High confidence result - prioritize medical consultation")
#                 recommendations.append("Discuss treatment options and lifestyle modifications")
#             else:
#                 recommendations.append("Moderate confidence - additional imaging may be helpful")
#                 recommendations.append("Consider repeat ultrasound for confirmation")
            
#             recommendations.append("Regular monitoring and follow-up recommended")
#         else:
#             recommendations.append("Continue regular gynecological check-ups")
#             recommendations.append("Maintain healthy lifestyle and monitor for any symptoms")
#             recommendations.append("Consult healthcare provider if symptoms develop")
#             recommendations.append("Routine screening as per medical guidelines")
        
#         recommendations.append("This AI analysis should be confirmed by a qualified radiologist")
#         recommendations.append("Multiple diagnostic criteria should be considered for PCOS diagnosis")
        
#         return recommendations
    
#     def validate_ultrasound(self, image_data):
#         """
#         Basic validation to check if image appears to be an ultrasound
#         """
#         try:
#             # Preprocess image
#             img_array = self.preprocess_image(image_data)
            
#             # Basic checks
#             # Ultrasounds typically have lower color variance and specific intensity patterns
#             img_std = np.std(img_array)
#             img_mean = np.mean(img_array)
            
#             # Very rough heuristic
#             is_likely_ultrasound = 20 < img_std < 100 and 50 < img_mean < 200
            
#             return {
#                 'isUltrasound': is_likely_ultrasound,
#                 'confidence': 0.7 if is_likely_ultrasound else 0.3,
#                 'reason': 'Image characteristics consistent with ultrasound' if is_likely_ultrasound else 'Image may not be an ultrasound'
#             }
            
#         except Exception as e:
#             return {
#                 'isUltrasound': False,
#                 'confidence': 0,
#                 'reason': f'Validation failed: {str(e)}'
#             }


# # Singleton instance
# predictor = UltrasoundPredictor()
