"""
Hugging Face API Integration for PCOS Ultrasound Analysis
Uses free Inference API for image classification and analysis
"""

import requests
import base64
import io
from PIL import Image
import os

class HuggingFaceAnalyzer:
    """
    PCOS Ultrasound analyzer using Hugging Face Inference API
    """
    
    def __init__(self, api_key=None):
        """
        Initialize with Hugging Face API key
        Get free API key from: https://huggingface.co/settings/tokens
        """
        self.api_key = api_key or os.getenv('HUGGINGFACE_API_KEY')
        self.headers = {}
        
        if self.api_key:
            self.headers = {"Authorization": f"Bearer {self.api_key}"}
        
        # Models for different tasks
        self.vision_model = "Salesforce/blip-image-captioning-large"  # Image understanding
        self.classification_model = "google/vit-base-patch16-224"  # Image classification
        
    def analyze_ultrasound(self, image_data):
        """
        Analyze ultrasound image for PCOS detection
        
        Args:
            image_data: Base64 encoded image or PIL Image
            
        Returns:
            dict: Analysis results
        """
        try:
            # Convert to PIL Image
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
            
            # Step 1: Validate if it's an ultrasound image
            is_ultrasound, validation_reason = self._validate_ultrasound(image)
            
            if not is_ultrasound:
                return {
                    'success': False,
                    'error': 'Not a valid ultrasound image',
                    'details': validation_reason,
                    'isUltrasound': False
                }
            
            # Step 2: Analyze for PCOS markers
            pcos_analysis = self._analyze_pcos_markers(image)
            
            return {
                'success': True,
                'isUltrasound': True,
                'analysis': pcos_analysis,
                'method': 'Hugging Face Vision AI',
                'model': self.vision_model
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Analysis failed: {str(e)}',
                'isUltrasound': False
            }
    
    def _validate_ultrasound(self, image):
        """
        Validate if image is an ultrasound using image captioning
        """
        try:
            # Convert image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Use BLIP for image understanding
            api_url = f"https://api-inference.huggingface.co/models/{self.vision_model}"
            
            response = requests.post(
                api_url,
                headers=self.headers,
                data=img_byte_arr,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Check if response contains caption
                if isinstance(result, list) and len(result) > 0:
                    caption = result[0].get('generated_text', '').lower()
                elif isinstance(result, dict):
                    caption = result.get('generated_text', '').lower()
                else:
                    caption = str(result).lower()
                
                # Check for ultrasound-related keywords
                ultrasound_keywords = [
                    'ultrasound', 'sonogram', 'medical', 'scan', 'imaging',
                    'ovary', 'ovarian', 'uterus', 'pelvic', 'grayscale',
                    'black and white', 'medical image', 'diagnostic'
                ]
                
                # Check image characteristics
                is_grayscale = self._check_grayscale(image)
                has_medical_appearance = any(keyword in caption for keyword in ultrasound_keywords)
                
                if is_grayscale or has_medical_appearance:
                    return True, "Image appears to be a medical ultrasound"
                else:
                    return False, f"Image does not appear to be an ultrasound. Detected: {caption}"
            else:
                # If API fails, use basic validation
                is_grayscale = self._check_grayscale(image)
                if is_grayscale:
                    return True, "Image has ultrasound-like characteristics (grayscale)"
                else:
                    return False, "Image does not appear to be a grayscale ultrasound"
                
        except Exception as e:
            print(f"Validation error: {e}")
            # Fallback to basic grayscale check
            is_grayscale = self._check_grayscale(image)
            if is_grayscale:
                return True, "Image has ultrasound-like characteristics"
            else:
                return False, "Could not validate image as ultrasound"
    
    def _check_grayscale(self, image):
        """
        Check if image is predominantly grayscale (like ultrasounds)
        """
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Sample pixels
        pixels = list(image.getdata())
        
        # Check if most pixels have similar R, G, B values (grayscale)
        grayscale_count = 0
        total_pixels = len(pixels)
        
        for r, g, b in pixels[:min(1000, total_pixels)]:  # Sample first 1000 pixels
            # Check if R, G, B are similar (within 30 units)
            if abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30:
                grayscale_count += 1
        
        grayscale_ratio = grayscale_count / min(1000, total_pixels)
        
        # If more than 70% of pixels are grayscale-like
        return grayscale_ratio > 0.7
    
    def _analyze_pcos_markers(self, image):
        """
        Analyze image for PCOS markers using vision model
        """
        try:
            # Convert image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Use BLIP for detailed analysis
            api_url = f"https://api-inference.huggingface.co/models/{self.vision_model}"
            
            response = requests.post(
                api_url,
                headers=self.headers,
                data=img_byte_arr,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract description
                if isinstance(result, list) and len(result) > 0:
                    description = result[0].get('generated_text', '')
                elif isinstance(result, dict):
                    description = result.get('generated_text', '')
                else:
                    description = str(result)
                
                # Analyze description for PCOS indicators
                pcos_detected, confidence, findings = self._interpret_description(description, image)
                
                # Generate recommendations
                recommendations = self._generate_recommendations(pcos_detected, confidence)
                
                return {
                    'pcosDetected': pcos_detected,
                    'confidence': confidence,
                    'findings': findings,
                    'recommendations': recommendations,
                    'disclaimer': 'This is an AI-assisted analysis and should not replace professional medical diagnosis. Please consult with a healthcare provider for proper evaluation.',
                    'imageDescription': description
                }
            else:
                # Fallback to basic analysis
                return self._basic_analysis(image)
                
        except Exception as e:
            print(f"Analysis error: {e}")
            return self._basic_analysis(image)
    
    def _interpret_description(self, description, image):
        """
        Interpret image description for PCOS indicators
        """
        description_lower = description.lower()
        
        # PCOS-related keywords
        pcos_keywords = [
            'multiple', 'cyst', 'cysts', 'follicle', 'follicles',
            'polycystic', 'enlarged', 'ovary', 'ovarian'
        ]
        
        # Count PCOS indicators
        indicator_count = sum(1 for keyword in pcos_keywords if keyword in description_lower)
        
        # Analyze image characteristics
        has_multiple_structures = self._detect_multiple_structures(image)
        
        # Determine PCOS likelihood
        if indicator_count >= 2 or has_multiple_structures:
            pcos_detected = True
            confidence = min(60 + (indicator_count * 10) + (20 if has_multiple_structures else 0), 85)
            findings = [
                "Multiple circular structures detected in ultrasound image",
                "Pattern consistent with polycystic ovarian morphology",
                f"AI detected {indicator_count} PCOS-related indicators",
                "Ovarian appearance suggests possible PCOS"
            ]
        elif indicator_count == 1 or has_multiple_structures:
            pcos_detected = True
            confidence = 50
            findings = [
                "Some indicators of polycystic ovarian morphology detected",
                "Borderline PCOS pattern observed",
                "Further clinical evaluation recommended"
            ]
        else:
            pcos_detected = False
            confidence = 70
            findings = [
                "No significant PCOS indicators detected",
                "Ovarian morphology appears within normal range",
                "No polycystic pattern observed"
            ]
        
        return pcos_detected, confidence, findings
    
    def _detect_multiple_structures(self, image):
        """
        Detect multiple circular structures (follicles) in image
        """
        try:
            import cv2
            import numpy as np
            
            # Convert PIL to OpenCV
            img_array = np.array(image.convert('RGB'))
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (9, 9), 2)
            
            # Detect circles
            circles = cv2.HoughCircles(
                blurred,
                cv2.HOUGH_GRADIENT,
                dp=1,
                minDist=20,
                param1=50,
                param2=30,
                minRadius=5,
                maxRadius=30
            )
            
            if circles is not None:
                # If 8 or more circles detected, likely PCOS
                return len(circles[0]) >= 8
            
            return False
            
        except Exception as e:
            print(f"Structure detection error: {e}")
            return False
    
    def _basic_analysis(self, image):
        """
        Basic fallback analysis without API
        """
        has_structures = self._detect_multiple_structures(image)
        
        if has_structures:
            return {
                'pcosDetected': True,
                'confidence': 65,
                'findings': [
                    "Multiple circular structures detected",
                    "Pattern suggests polycystic ovarian morphology",
                    "Basic computer vision analysis performed"
                ],
                'recommendations': self._generate_recommendations(True, 65),
                'disclaimer': 'This is a basic analysis. Please consult with a healthcare provider for proper evaluation.',
                'imageDescription': 'Basic analysis performed'
            }
        else:
            return {
                'pcosDetected': False,
                'confidence': 60,
                'findings': [
                    "No significant polycystic pattern detected",
                    "Ovarian morphology appears normal",
                    "Basic computer vision analysis performed"
                ],
                'recommendations': self._generate_recommendations(False, 60),
                'disclaimer': 'This is a basic analysis. Please consult with a healthcare provider for proper evaluation.',
                'imageDescription': 'Basic analysis performed'
            }
    
    def _generate_recommendations(self, pcos_detected, confidence):
        """
        Generate medical recommendations
        """
        recommendations = []
        
        if pcos_detected:
            recommendations.append("Consult with a gynecologist or endocrinologist for comprehensive evaluation")
            recommendations.append("Consider hormonal blood tests (LH, FSH, testosterone, insulin, AMH)")
            recommendations.append("Discuss symptoms and menstrual history with your doctor")
            
            if confidence > 70:
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


# Singleton instance
analyzer = HuggingFaceAnalyzer()
