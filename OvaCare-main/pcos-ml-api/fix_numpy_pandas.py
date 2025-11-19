"""
Quick fix for numpy/pandas compatibility issue
"""

import subprocess
import sys

print("\n" + "="*60)
print("FIXING NUMPY/PANDAS COMPATIBILITY")
print("="*60)

print("\nThis will fix the 'numpy.dtype size changed' error")
print("Reinstalling numpy and pandas with compatible versions...\n")

try:
    # Uninstall current versions
    print("Uninstalling current numpy and pandas...")
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'uninstall', '-y', 'numpy', 'pandas'
    ])
    
    # Install compatible versions
    print("\nInstalling compatible versions...")
    subprocess.check_call([
        sys.executable, '-m', 'pip', 'install', 
        'numpy==1.26.4', 
        'pandas==2.2.0'
    ])
    
    print("\n" + "="*60)
    print("✅ NUMPY/PANDAS FIXED!")
    print("="*60)
    print("\nYou can now run:")
    print("  python app.py")
    print("  or")
    print("  python fix_dependencies.py  (to install all packages)")
    
except Exception as e:
    print(f"\n❌ Fix failed: {e}")
    print("\nPlease run manually:")
    print("pip uninstall -y numpy pandas")
    print("pip install numpy==1.26.4 pandas==2.2.0")
