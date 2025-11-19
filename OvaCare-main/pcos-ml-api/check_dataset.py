"""
Quick script to check if dataset is accessible
"""

import os
from pathlib import Path

print("\n" + "="*60)
print("CHECKING PCOS DATASET")
print("="*60)

print(f"\nCurrent directory: {os.getcwd()}")

# Check paths
pcos_dir = Path("../PCOS (1)/PCOS/infected")
normal_dir = Path("../PCOS (1)/PCOS/notinfected")

print(f"\nLooking for PCOS images at: {pcos_dir.absolute()}")
print(f"Looking for Normal images at: {normal_dir.absolute()}")

# Check if directories exist
if pcos_dir.exists():
    pcos_images = list(pcos_dir.glob("*.jpg")) + list(pcos_dir.glob("*.jpeg")) + list(pcos_dir.glob("*.png"))
    print(f"\n✅ PCOS directory found!")
    print(f"   Found {len(pcos_images)} PCOS images")
else:
    print(f"\n❌ PCOS directory NOT found!")

if normal_dir.exists():
    normal_images = list(normal_dir.glob("*.jpg")) + list(normal_dir.glob("*.jpeg")) + list(normal_dir.glob("*.png"))
    print(f"\n✅ Normal directory found!")
    print(f"   Found {len(normal_images)} Normal images")
else:
    print(f"\n❌ Normal directory NOT found!")

if pcos_dir.exists() and normal_dir.exists():
    print("\n" + "="*60)
    print("✅ DATASET READY FOR TRAINING!")
    print("="*60)
    print(f"\nTotal images: {len(pcos_images) + len(normal_images)}")
    print("\nYou can now run:")
    print("  python train_huggingface_pcos.py")
    print("  or")
    print("  python quick_train.py")
else:
    print("\n" + "="*60)
    print("❌ DATASET NOT FOUND!")
    print("="*60)
    print("\nPlease ensure your PCOS dataset is in the correct location.")
