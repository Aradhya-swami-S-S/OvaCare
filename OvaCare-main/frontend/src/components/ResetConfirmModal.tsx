import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface ResetConfirmModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ onClose, onSuccess }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  const handleReset = async () => {
    if (!confirmed) {
      setError('Please confirm that you want to reset your tracker');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.delete(
        `${API_BASE_URL}/api/period/reset`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset tracker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Reset Tracker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">
              ⚠️ Warning: This action cannot be undone!
            </p>
            <p className="text-red-700 text-sm">
              Resetting your tracker will permanently delete:
            </p>
            <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
              <li>All logged period cycles</li>
              <li>All notes and symptom logs</li>
              <li>Your cycle history and predictions</li>
            </ul>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="confirm-reset"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="confirm-reset" className="text-sm text-gray-700">
              I understand that this will permanently delete all my period tracking data and this action cannot be undone.
            </label>
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
              onClick={handleReset}
              disabled={loading || !confirmed}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Tracker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;