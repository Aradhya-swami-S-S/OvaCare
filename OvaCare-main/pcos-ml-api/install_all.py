"""
Complete Installation Script
Fixes all dependency issues and installs everything needed
"""

import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        subprocess.check_call(cmd, shell=False)
        print(f"✅ {description} - Done")
        return True
    except Exception as e:
        print(f"⚠️  {description} - Warning: {e}")
        return False

print("\n" + "="*60)
print("COMPLETE INSTALLATION FOR PCOS DETECTION")
print("="*60)
print("\nThis will:")
print("1. Fix numpy/pandas compatibility")
print("2. Install PyTorch and Transformers")
print("3. Install all required packages")
print("\nThis may take 5-10 minutes...")
print("="*60)

# Step 1: Fix numpy/pandas
print("\n📦 STEP 1: Removing TensorFlow (conflicts with PyTorch)")
run_command(
    [sys.executable, '-m', 'pip', 'uninstall', '-y', 'tensorflow', 'tensorflow-intel', 'keras', 'tf-keras'],
    "Uninstalling TensorFlow/Keras"
)

print("\n📦 STEP 2: Fixing numpy/pandas compatibility")
run_command(
    [sys.executable, '-m', 'pip', 'uninstall', '-y', 'numpy', 'pandas'],
    "Uninstalling old numpy/pandas"
)
run_command(
    [sys.executable, '-m', 'pip', 'install', 'numpy==1.26.4', 'pandas==2.2.0'],
    "Installing compatible numpy/pandas"
)

# Step 3: Install PyTorch
print("\n🔥 STEP 3: Installing PyTorch")
run_command(
    [sys.executable, '-m', 'pip', 'install', 'torch', 'torchvision'],
    "Installing PyTorch"
)

# Step 4: Install Transformers and related
print("\n🤗 STEP 4: Installing Transformers")
run_command(
    [sys.executable, '-m', 'pip', 'install', 'transformers', 'accelerate'],
    "Installing Transformers"
)

# Step 5: Install other dependencies
print("\n📦 STEP 5: Installing other packages")
packages = [
    'Pillow',
    'scikit-learn',
    'flask',
    'flask-cors'
]

for package in packages:
    run_command(
        [sys.executable, '-m', 'pip', 'install', package],
        f"Installing {package}"
    )

# Verify installation
print("\n" + "="*60)
print("VERIFYING INSTALLATION")
print("="*60)

required_packages = [
    'numpy',
    'pandas',
    'torch',
    'transformers',
    'PIL',
    'sklearn',
    'flask'
]

all_good = True
for package in required_packages:
    try:
        if package == 'PIL':
            __import__('PIL')
        elif package == 'sklearn':
            __import__('sklearn')
        else:
            __import__(package)
        print(f"✅ {package:15} - Installed")
    except ImportError:
        print(f"❌ {package:15} - NOT installed")
        all_good = False

print("\n" + "="*60)
if all_good:
    print("✅ ALL PACKAGES INSTALLED SUCCESSFULLY!")
    print("="*60)
    print("\nYou can now:")
    print("1. Check dataset: python check_dataset.py")
    print("2. Train model: python train_huggingface_pcos.py")
    print("3. Start ML API: python app.py")
else:
    print("⚠️  SOME PACKAGES MISSING")
    print("="*60)
    print("\nPlease check the errors above and try:")
    print("pip install -r requirements_huggingface.txt")

print("\n" + "="*60)
