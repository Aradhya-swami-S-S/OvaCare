"""
Remove TensorFlow - It conflicts with PyTorch for Hugging Face
"""

import subprocess
import sys

print("\n" + "="*60)
print("REMOVING TENSORFLOW")
print("="*60)
print("\nTensorFlow conflicts with PyTorch for Hugging Face models.")
print("We only need PyTorch for this project.\n")

tensorflow_packages = [
    'tensorflow',
    'tensorflow-intel',
    'tensorflow-cpu',
    'tensorflow-gpu',
    'keras',
    'tf-keras'
]

print("Uninstalling TensorFlow and Keras packages...")

for package in tensorflow_packages:
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'uninstall', '-y', package
        ])
        print(f"✅ Removed {package}")
    except:
        pass  # Package not installed, skip

print("\n" + "="*60)
print("✅ TENSORFLOW REMOVED!")
print("="*60)
print("\nNow install PyTorch and other packages:")
print("  python install_all.py")
print("\nOr manually:")
print("  pip install torch torchvision transformers Pillow scikit-learn accelerate")
