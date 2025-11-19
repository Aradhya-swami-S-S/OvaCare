"""
Fix Dependencies - Install correct packages for Hugging Face training
"""

import subprocess
import sys

print("\n" + "="*60)
print("FIXING DEPENDENCIES")
print("="*60)

print("\nStep 1: Fixing numpy/pandas compatibility...")
try:
    # First, fix numpy/pandas compatibility
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'uninstall', '-y', 'numpy', 'pandas'
    ])
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', 'numpy==1.26.4', 'pandas==2.2.0'
    ])
    print("✅ numpy/pandas fixed")
except Exception as e:
    print(f"⚠️  Warning: {e}")

packages_to_install = [
    'torch',
    'torchvision', 
    'transformers',
    'Pillow',
    'scikit-learn',
    'accelerate',
    'flask',
    'flask-cors'
]

print("\nStep 2: Installing required packages...")
print("This may take a few minutes...\n")

try:
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', '--upgrade'
    ] + packages_to_install)
    
    print("\n" + "="*60)
    print("✅ ALL DEPENDENCIES INSTALLED!")
    print("="*60)
    print("\nYou can now run:")
    print("  python train_huggingface_pcos.py")
    print("  or")
    print("  python quick_train.py")
    
except Exception as e:
    print(f"\n❌ Installation failed: {e}")
    print("\nPlease install manually:")
    print("pip install torch torchvision transformers Pillow numpy scikit-learn accelerate")
