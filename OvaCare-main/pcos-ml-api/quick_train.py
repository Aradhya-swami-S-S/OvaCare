"""
Quick Training Script - One Command Setup
Checks dependencies and trains Hugging Face PCOS model
"""

import subprocess
import sys
import os

def check_and_install_dependencies():
    """Check and install required packages"""
    print("\n" + "="*60)
    print("CHECKING DEPENDENCIES")
    print("="*60)
    
    required_packages = [
        'torch',
        'torchvision',
        'transformers',
        'Pillow',
        'numpy',
        'scikit-learn'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} not installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        print("This may take a few minutes...")
        
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install',
                'torch', 'torchvision', 'transformers', 
                'Pillow', 'numpy', 'scikit-learn', 'accelerate'
            ])
            print("✅ All dependencies installed!")
        except Exception as e:
            print(f"❌ Installation failed: {e}")
            print("\nPlease install manually:")
            print("pip install torch torchvision transformers Pillow numpy scikit-learn")
            return False
    else:
        print("\n✅ All dependencies already installed!")
    
    return True

def check_dataset():
    """Check if dataset exists"""
    print("\n" + "="*60)
    print("CHECKING DATASET")
    print("="*60)
    
    pcos_dir = "../PCOS (1)/PCOS/infected"
    normal_dir = "../PCOS (1)/PCOS/notinfected"
    
    if not os.path.exists(pcos_dir):
        print(f"❌ PCOS images not found at: {pcos_dir}")
        return False
    
    if not os.path.exists(normal_dir):
        print(f"❌ Normal images not found at: {normal_dir}")
        return False
    
    # Count images
    pcos_count = len([f for f in os.listdir(pcos_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    normal_count = len([f for f in os.listdir(normal_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    print(f"✅ Found {pcos_count} PCOS images")
    print(f"✅ Found {normal_count} Normal images")
    print(f"✅ Total: {pcos_count + normal_count} images")
    
    if pcos_count < 10 or normal_count < 10:
        print("⚠️  Warning: Very few images. Model may not train well.")
        return False
    
    return True

def train_model():
    """Train the Hugging Face model"""
    print("\n" + "="*60)
    print("STARTING TRAINING")
    print("="*60)
    print("This will take 10-20 minutes...")
    print("You can monitor progress below:")
    print("="*60 + "\n")
    
    try:
        # Import and run training
        from train_huggingface_pcos import train_huggingface_model, test_model
        
        model, processor = train_huggingface_model()
        
        if model:
            print("\n🧪 Testing model...")
            test_model()
            return True
        else:
            print("❌ Training failed")
            return False
            
    except Exception as e:
        print(f"❌ Training error: {e}")
        return False

def main():
    """Main setup and training pipeline"""
    print("\n" + "="*60)
    print("🤖 HUGGING FACE PCOS MODEL - QUICK TRAINING")
    print("="*60)
    print("This script will:")
    print("1. Check and install dependencies")
    print("2. Verify your PCOS dataset")
    print("3. Train Hugging Face Vision Transformer")
    print("4. Test the trained model")
    print("="*60)
    
    # Step 1: Check dependencies
    if not check_and_install_dependencies():
        print("\n❌ Dependency check failed. Please install manually.")
        return
    
    # Step 2: Check dataset
    if not check_dataset():
        print("\n❌ Dataset check failed.")
        print("Please ensure your PCOS dataset is in:")
        print("  - PCOS (1)/PCOS/infected/")
        print("  - PCOS (1)/PCOS/notinfected/")
        return
    
    # Step 3: Train model
    print("\n" + "="*60)
    print("🚀 READY TO TRAIN!")
    print("="*60)
    
    response = input("\nStart training? (y/n): ").lower()
    
    if response == 'y':
        success = train_model()
        
        if success:
            print("\n" + "="*60)
            print("🎉 SUCCESS! MODEL TRAINED!")
            print("="*60)
            print("\nNext steps:")
            print("1. Start ML API: python app.py")
            print("2. Start backend: npm start (in backend folder)")
            print("3. Start frontend: npm run dev (in frontend folder)")
            print("4. Upload ultrasound images to test!")
            print("\n✅ Your model will now give accurate PCOS predictions!")
        else:
            print("\n❌ Training failed. Check errors above.")
    else:
        print("\n⏸️  Training cancelled.")
        print("Run 'python train_huggingface_pcos.py' when ready.")

if __name__ == '__main__':
    main()
