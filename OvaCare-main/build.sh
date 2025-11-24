#!/bin/bash

# Build script for Render deployment

echo "🚀 Starting OvaCare build process..."

# Build Frontend
echo "📦 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci
cd ..

# Install ML API Dependencies
echo "📦 Installing ML API dependencies..."
cd pcos-ml-api
pip install -r requirements.txt
cd ..

echo "✅ Build completed successfully!"