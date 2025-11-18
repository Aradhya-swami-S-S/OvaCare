import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface SetTrackerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SetTrackerModal: React.FC<SetTrackerModalProps> = ({ onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!startDate) {
      setError('Please select a date');
      setLoading(false);
      return;
    }

    const selectedDate = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      setError('Start date cannot be in the future');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/period/start`,
        { startDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set tracker');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Set Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Select the first day of your last period. This will help us predict your next cycle.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your next period will be predicted based on a 30-day cycle by default. 
              After logging 3 or more cycles, we'll use your average cycle length for more accurate predictions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetTrackerModal;