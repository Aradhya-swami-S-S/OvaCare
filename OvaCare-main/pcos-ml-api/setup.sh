#!/bin/bash

# PCOS ML API Setup Script
# This script sets up everything needed for PCOS detection

echo "=========================================="
echo "PCOS ML API Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

if ! python -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
    echo "❌ Error: Python 3.8 or higher required"
    exit 1
fi
echo "✅ Python version OK"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check if symptom model exists
if [ ! -f "model/pcos_model.pkl" ]; then
    echo "⚠️  Symptom model not found"
    echo "Training symptom model..."
    python train_model.py
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to train symptom model"
        exit 1
    fi
    echo "✅ Symptom model trained"
else
    echo "✅ Symptom model found"
fi
echo ""

# Check if CNN model exists
if [ ! -f "model/pcos_ultrasound_model.h5" ]; then
    echo "⚠️  CNN model not found"
    echo "Training CNN model (this may take a few minutes)..."
    python train_ultrasound_model.py
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to train CNN model"
        echo "   You can still use symptom-based prediction"
    else
        echo "✅ CNN model trained"
    fi
else
    echo "✅ CNN model found"
fi
echo ""

# Run tests
echo "Running tests..."
python test_models.py

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the API server:"
echo "  python app.py"
echo ""
echo "The server will run on http://localhost:5001"
echo ""
