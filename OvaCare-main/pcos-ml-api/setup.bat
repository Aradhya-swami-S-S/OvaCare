@echo off
REM PCOS ML API Setup Script for Windows
REM This script sets up everything needed for PCOS detection

echo ==========================================
echo PCOS ML API Setup
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version
if errorlevel 1 (
    echo Error: Python not found
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)
echo Python OK
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed
echo.

REM Check if symptom model exists
if not exist "model\pcos_model.pkl" (
    echo Symptom model not found
    echo Training symptom model...
    python train_model.py
    if errorlevel 1 (
        echo Error: Failed to train symptom model
        pause
        exit /b 1
    )
    echo Symptom model trained
) else (
    echo Symptom model found
)
echo.

REM Check if CNN model exists
if not exist "model\pcos_ultrasound_model.h5" (
    echo CNN model not found
    echo Training CNN model (this may take a few minutes)...
    python train_ultrasound_model.py
    if errorlevel 1 (
        echo Error: Failed to train CNN model
        echo You can still use symptom-based prediction
    ) else (
        echo CNN model trained
    )
) else (
    echo CNN model found
)
echo.

REM Run tests
echo Running tests...
python test_models.py

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the API server:
echo   python app.py
echo.
echo The server will run on http://localhost:5001
echo.
pause
