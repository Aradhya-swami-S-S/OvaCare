"""
Test Model Accuracy on Real Images
Verifies that the model gives different results for PCOS vs Normal
"""

import os
from pathlib import Path
from PIL import Image
from huggingface_pcos_predictor import hf_predictor

def test_images(folder, expected_label, num_images=10):
    """
    Test multiple images from a folder
    
    Args:
        folder: Path to image folder
        expected_label: "PCOS" or "Normal"
        num_images: Number of images to test
    """
    print(f"\n{'='*60}")
    print(f"Testing {expected_label} Images")
    print(f"{'='*60}")
    
    folder_path = Path(folder)
    
    # Get all image files
    images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        images.extend(list(folder_path.glob(ext)))
    
    if len(images) == 0:
        print(f"❌ No images found in {folder}")
        return 0, 0
    
    print(f"Found {len(images)} images, testing first {num_images}...")
    print()
    
    correct = 0
    total = 0
    confidences = []
    
    for img_path in images[:num_images]:
        try:
            # Load image
            image = Image.open(img_path).convert('RGB')
            
            # Make prediction
            result = hf_predictor.predict(image)
            
            if result['success']:
                predicted = "PCOS" if result['analysis']['pcosDetected'] else "Normal"
                confidence = result['analysis']['confidence']
                pcos_prob = result['metrics']['pcosProbability']
                normal_prob = result['metrics']['normalProbability']
                
                is_correct = (predicted == expected_label)
                
                if is_correct:
                    correct += 1
                
                confidences.append(confidence)
                
                # Print result
                status = "✅" if is_correct else "❌"
                print(f"{status} {img_path.name[:30]:30} | Predicted: {predicted:6} | Confidence: {confidence:3}% | PCOS: {pcos_prob:5.1f}% | Normal: {normal_prob:5.1f}%")
                
                total += 1
            else:
                print(f"⚠️  {img_path.name[:30]:30} | Failed: {result.get('error', 'Unknown error')}")
        
        except Exception as e:
            print(f"❌ {img_path.name[:30]:30} | Error: {str(e)}")
    
    # Calculate statistics
    accuracy = (correct / total * 100) if total > 0 else 0
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
    min_confidence = min(confidences) if confidences else 0
    max_confidence = max(confidences) if confidences else 0
    
    print()
    print(f"{'='*60}")
    print(f"Results for {expected_label} Images:")
    print(f"  Accuracy: {correct}/{total} ({accuracy:.1f}%)")
    print(f"  Avg Confidence: {avg_confidence:.1f}%")
    print(f"  Confidence Range: {min_confidence:.0f}% - {max_confidence:.0f}%")
    print(f"{'='*60}")
    
    return correct, total

def main():
    """Main testing function"""
    print("\n" + "="*60)
    print("HUGGING FACE PCOS MODEL - ACCURACY TEST")
    print("="*60)
    print("This will test the model on real PCOS and Normal images")
    print("to verify it gives different, accurate results")
    print("="*60)
    
    # Check if model is loaded
    if hf_predictor.model is None:
        print("\n❌ Model not loaded!")
        print("Please train the model first:")
        print("  python train_huggingface_pcos.py")
        return
    
    print("\n✅ Model loaded successfully")
    
    # Test PCOS images
    pcos_correct, pcos_total = test_images(
        "../PCOS (1)/PCOS/infected",
        "PCOS",
        num_images=10
    )
    
    # Test Normal images
    normal_correct, normal_total = test_images(
        "../PCOS (1)/PCOS/notinfected",
        "Normal",
        num_images=10
    )
    
    # Overall statistics
    total_correct = pcos_correct + normal_correct
    total_images = pcos_total + normal_total
    overall_accuracy = (total_correct / total_images * 100) if total_images > 0 else 0
    
    print("\n" + "="*60)
    print("OVERALL RESULTS")
    print("="*60)
    print(f"Total Images Tested: {total_images}")
    print(f"Correct Predictions: {total_correct}")
    print(f"Overall Accuracy: {overall_accuracy:.1f}%")
    print()
    
    if overall_accuracy >= 85:
        print("🎉 EXCELLENT! Model is working correctly!")
        print("   - Different results for PCOS vs Normal")
        print("   - High accuracy (>85%)")
        print("   - Varying confidence scores")
    elif overall_accuracy >= 75:
        print("✅ GOOD! Model is working well!")
        print("   - Decent accuracy (>75%)")
        print("   - Consider training for more epochs")
    else:
        print("⚠️  LOW ACCURACY!")
        print("   - Model may need more training")
        print("   - Check dataset quality")
        print("   - Try training for more epochs")
    
    print("="*60)
    
    # Verification
    print("\n" + "="*60)
    print("VERIFICATION")
    print("="*60)
    
    if pcos_total > 0 and normal_total > 0:
        pcos_acc = (pcos_correct / pcos_total * 100)
        normal_acc = (normal_correct / normal_total * 100)
        
        print(f"✅ PCOS Detection: {pcos_acc:.1f}%")
        print(f"✅ Normal Detection: {normal_acc:.1f}%")
        
        if abs(pcos_acc - normal_acc) < 20:
            print("✅ Balanced performance on both classes")
        else:
            print("⚠️  Imbalanced performance - may need more training")
    
    print("="*60)
    
    print("\n✅ Testing complete!")
    print("\nNext steps:")
    print("1. If accuracy is good (>85%), start using the model")
    print("2. If accuracy is low (<75%), train for more epochs")
    print("3. Start ML API: python app.py")
    print("4. Test in your web application")

if __name__ == '__main__':
    main()
