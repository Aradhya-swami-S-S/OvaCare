# api.py

from flask import Flask, request, jsonify
import pickle
import numpy as np
import os
from flask_cors import CORS

# Initialize app
app = Flask(__name__)
CORS(app)

# Load model
model_path = 'model/pcos_model.pkl'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model not found at {model_path}")

with open(model_path, 'rb') as f:
    model = pickle.load(f)

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    try:
        # Extract features from JSON
        age = float(data['age'])
        bmi = float(data['bmi'])
        hair_growth = int(data['hair_growth'])  # 0 or 1
        pimples = int(data['pimples'])          # 0 or 1
        cycle = 1 if data['cycle'].lower() == 'irregular' else 0  # 'Regular' -> 0, 'Irregular' -> 1

        features = np.array([[age, bmi, hair_growth, pimples, cycle]])

        # Predict
        prediction = model.predict(features)[0]
        result = "PCOS Detected" if prediction == 1 else "No PCOS Detected"

        return jsonify({'prediction': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Run app
if __name__ == '__main__':
    app.run(debug=True)
