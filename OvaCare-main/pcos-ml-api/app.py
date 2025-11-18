from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
with open('model/pcos_model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def home():
    return "PCOS Prediction API is running."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        # Build DataFrame with same columns used in training
        input_df = pd.DataFrame([{
            'age (yrs)': float(data['age']),
            'bmi': float(data['bmi']),
            'hair growth(y/n)': int(data['hairGrowth']),
            'pimples(y/n)': int(data['acne']),
            'cycle(r/i)': int(data['irregularPeriods']),
        }])

        print("Input DF:\n", input_df)

        # Make prediction
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])

        return jsonify({
            'prediction': prediction,            # 0 = No PCOS, 1 = PCOS
            'probability': round(probability * 100, 2)  # percentage
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
