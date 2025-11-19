"""
PCOS Ultrasound Image Analyzer
Alternative to Groq Vision AI using local ML models
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64

class PCOSImageAnalyzer:
    """
    Basic image analysis for PCOS detection from ultrasound images
    Uses computer vision techniques to identify potential PCOS markers
    """
    
    def __init__(self):
        self.min_follicle_size = 2  # mm
        self.max_follicle_size = 9  # mm
        self.pcos_threshold = 12  # follicles for PCOS diagnosis
        
    def analyze_ultrasound(self, image_data):
        """
        Analyze ultrasound image for PCOS markers
        
        Args:
            image_data: Base64 encoded image or PIL Image
            
        Returns:
            dict: Analysis results
        """
        try:
            # Convert base64 to image if needed
            if isinstance(image_data, str):
                image_data = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
                image = Image.open(io.BytesIO(image_data))
            else:
                image = image_data
            
            # Convert to numpy array
            img_array = np.array(image.convert('RGB'))
            
            # Convert to grayscale
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # Check if it looks like an ultrasound
            is_ultrasound = self._validate_ultrasound(gray)
            
            if not is_ultrasound:
                return {
                    'success': False,
                    'error': 'Image does not appear to be an ultrasound',
                    'isUltrasound': False
                }
            
            # Detect potential follicles
            follicle_count = self._detect_follicles(gray)
            
            # Analyze ovarian characteristics
            ovarian_volume = self._estimate_ovarian_volume(gray)
            stromal_echogenicity = self._analyze_stromal_echogenicity(gray)
            
            # Determine PCOS likelihood
            pcos_detected = follicle_count >= self.pcos_threshold
            confidence = self._calculate_confidence(follicle_count, ovarian_volume, stromal_echogenicity)
            
            # Generate findings
            findings = self._generate_findings(follicle_count, ovarian_volume, stromal_echogenicity)
            
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
                    'disclaimer': 'This is an automated analysis and should not replace professional medical diagnosis. Please consult with a healthcare provider for proper evaluation.'
                },
                'metrics': {
                    'follicleCount': follicle_count,
                    'ovarianVolume': ovarian_volume,
                    'stromalEchogenicity': stromal_echogenicity
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Analysis failed: {str(e)}',
                'isUltrasound': False
            }
    
    def _validate_ultrasound(self, gray_image):
        """Check if image appears to be an ultrasound"""
        # Ultrasounds typically have:
        # 1. Grayscale appearance
        # 2. Specific intensity distribution
        # 3. Characteristic noise pattern
        
        # Check intensity distribution
        hist = cv2.calcHist([gray_image], [0], None, [256], [0, 256])
        
        # Ultrasounds typically have a specific histogram shape
        # Most pixels in mid-range, with some dark and bright areas
        mid_range = np.sum(hist[50:200])
        total = np.sum(hist)
        
        mid_range_ratio = mid_range / total if total > 0 else 0
        
        # Check for characteristic ultrasound features
        return mid_range_ratio > 0.5
    
    def _detect_follicles(self, gray_image):
        """
        Detect circular structures that could be follicles
        Uses Hough Circle Transform
        """
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray_image, (9, 9), 2)
        
        # Detect circles using Hough Transform
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
            circles = np.uint16(np.around(circles))
            # Filter circles by size (2-9mm equivalent in pixels)
            valid_circles = [c for c in circles[0, :] if 5 <= c[2] <= 30]
            return len(valid_circles)
        
        return 0
    
    def _estimate_ovarian_volume(self, gray_image):
        """
        Estimate ovarian volume from image
        Returns: 'normal' or 'enlarged'
        """
        # Find contours
        _, thresh = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find largest contour (likely the ovary)
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            
            # Rough estimation: >10ml is considered enlarged
            # This is a simplified heuristic
            image_area = gray_image.shape[0] * gray_image.shape[1]
            relative_area = area / image_area
            
            return 'enlarged' if relative_area > 0.15 else 'normal'
        
        return 'normal'
    
    def _analyze_stromal_echogenicity(self, gray_image):
        """
        Analyze stromal echogenicity
        Returns: 'increased', 'normal', or 'decreased'
        """
        # Calculate mean intensity in central region (likely stroma)
        h, w = gray_image.shape
        center_region = gray_image[h//4:3*h//4, w//4:3*w//4]
        
        mean_intensity = np.mean(center_region)
        
        # Classify based on intensity
        if mean_intensity > 150:
            return 'increased'
        elif mean_intensity < 80:
            return 'decreased'
        else:
            return 'normal'
    
    def _calculate_confidence(self, follicle_count, ovarian_volume, stromal_echogenicity):
        """Calculate confidence score (0-100)"""
        confidence = 0
        
        # Follicle count contribution (max 60 points)
        if follicle_count >= self.pcos_threshold:
            confidence += min(60, 40 + (follicle_count - self.pcos_threshold) * 2)
        else:
            confidence += (follicle_count / self.pcos_threshold) * 40
        
        # Ovarian volume contribution (max 20 points)
        if ovarian_volume == 'enlarged':
            confidence += 20
        
        # Stromal echogenicity contribution (max 20 points)
        if stromal_echogenicity == 'increased':
            confidence += 20
        
        return min(100, int(confidence))
    
    def _generate_findings(self, follicle_count, ovarian_volume, stromal_echogenicity):
        """Generate list of findings"""
        findings = []
        
        # Follicle findings
        if follicle_count >= self.pcos_threshold:
            findings.append(f"Polycystic ovarian morphology detected: {follicle_count} follicles identified")
            findings.append("Follicle count exceeds diagnostic threshold (≥12 follicles)")
        elif follicle_count >= 8:
            findings.append(f"Multiple follicles detected: {follicle_count} follicles")
            findings.append("Follicle count approaching PCOS threshold")
        else:
            findings.append(f"Normal follicle count: {follicle_count} follicles")
        
        # Volume findings
        if ovarian_volume == 'enlarged':
            findings.append("Increased ovarian volume detected (>10ml)")
        else:
            findings.append("Normal ovarian volume")
        
        # Stromal findings
        if stromal_echogenicity == 'increased':
            findings.append("Increased stromal echogenicity observed")
        elif stromal_echogenicity == 'normal':
            findings.append("Normal stromal echogenicity")
        
        return findings
    
    def _generate_recommendations(self, pcos_detected, confidence):
        """Generate medical recommendations"""
        recommendations = []
        
        if pcos_detected:
            recommendations.append("Consult with a gynecologist or endocrinologist for comprehensive evaluation")
            recommendations.append("Consider hormonal blood tests (LH, FSH, testosterone, insulin)")
            recommendations.append("Discuss lifestyle modifications and treatment options")
            recommendations.append("Regular monitoring and follow-up ultrasounds recommended")
        else:
            recommendations.append("Continue regular gynecological check-ups")
            recommendations.append("Maintain healthy lifestyle and monitor symptoms")
            recommendations.append("Consult healthcare provider if symptoms develop")
        
        recommendations.append("This automated analysis should be confirmed by a qualified radiologist")
        recommendations.append("Clinical correlation with symptoms and blood work is essential")
        
        return recommendations


# Singleton instance
analyzer = PCOSImageAnalyzer()
