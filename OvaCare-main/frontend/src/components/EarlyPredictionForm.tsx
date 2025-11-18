import React, { useState } from 'react';
import axios from 'axios';

const EarlyPredictionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    hairGrowth: '',
    acne: '',
    irregularPeriods: '',
  });

  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const validateForm = (): boolean => {
    const age = parseFloat(formData.age);
    const bmi = parseFloat(formData.bmi);

    if (isNaN(age) || age < 14 || age > 50) {
      setError('Age must be between 14 and 50 years');
      return false;
    }

    if (isNaN(bmi) || bmi < 15 || bmi > 40) {
      setError('BMI must be between 15 and 40');
      return false;
    }

    if (!formData.hairGrowth || !formData.acne || !formData.irregularPeriods) {
      setError('Please fill in all fields');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/predict', formData);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        const probability = response.data.probability;
        const hasPCOS = response.data.prediction === 1;
        setPrediction(
          hasPCOS 
            ? `⚠️ PCOS Risk Detected: ${probability}% probability` 
            : `✓ Low PCOS Risk: ${probability}% probability`
        );
      }
    } catch (error: any) {
      console.error('Prediction error:', error);
      setError(
        error.response?.data?.error || 
        'Unable to connect to prediction service. Please ensure the ML API is running on port 5001.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age (14-50 years)
        </label>
        <input
          type="number"
          name="age"
          id="age"
          value={formData.age}
          onChange={handleChange}
          min="14"
          max="50"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder="Enter age between 14-50"
          required
        />
      </div>

      {/* BMI */}
      <div>
        <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">
          BMI - Body Mass Index (15-40)
        </label>
        <input
          type="number"
          name="bmi"
          id="bmi"
          value={formData.bmi}
          onChange={handleChange}
          min="15"
          max="40"
          step="0.1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder="Enter BMI between 15-40"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Calculate BMI: Weight (kg) ÷ Height² (m²)
        </p>
      </div>

      {/* Hair Growth */}
      <div>
        <label htmlFor="hairGrowth" className="block text-sm font-medium text-gray-700">
          Excessive Hair Growth
        </label>
        <select
          name="hairGrowth"
          id="hairGrowth"
          value={formData.hairGrowth}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          required
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>

      {/* Acne */}
      <div>
        <label htmlFor="acne" className="block text-sm font-medium text-gray-700">
          Acne
        </label>
        <select
          name="acne"
          id="acne"
          value={formData.acne}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          required
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>

      {/* Irregular Periods */}
      <div>
        <label htmlFor="irregularPeriods" className="block text-sm font-medium text-gray-700">
          Irregular Periods
        </label>
        <select
          name="irregularPeriods"
          id="irregularPeriods"
          value={formData.irregularPeriods}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          required
        >
          <option value="">Select</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={loading}
        >
          {loading ? 'Predicting...' : 'Get Prediction'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mt-4 text-sm font-medium rounded-md text-red-800 bg-red-50 border border-red-300">
          {error}
        </div>
      )}

      {/* Result */}
      {prediction && (
        <div className={`p-4 mt-4 text-sm font-medium rounded-md ${
          prediction.includes('Risk Detected') 
            ? 'text-orange-800 bg-orange-50 border border-orange-300' 
            : 'text-green-800 bg-green-50 border border-green-300'
        }`}>
          {prediction}
        </div>
      )}
    </form>
  );
};

export default EarlyPredictionForm;
