import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface AddNoteModalProps {
  periodId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Medication {
  name: string;
  dosage: string;
  time: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ periodId, onClose, onSuccess }) => {
  const [cramps, setCramps] = useState('none');
  const [flow, setFlow] = useState('medium');
  const [mood, setMood] = useState('neutral');
  const [pain, setPain] = useState(0);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', time: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE_URL}/api/period/notes`,
        {
          periodId,
          symptoms: { cramps, flow, mood, pain },
          medications: medications.filter(m => m.name.trim() !== ''),
          customNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Add Note</h2>
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Cramps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cramps Intensity
            </label>
            <select
              value={cramps}
              onChange={(e) => setCramps(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          {/* Flow */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flow Level
            </label>
            <select
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="spotting">Spotting</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="happy">Happy</option>
              <option value="neutral">Neutral</option>
              <option value="sad">Sad</option>
              <option value="irritable">Irritable</option>
              <option value="anxious">Anxious</option>
            </select>
          </div>

          {/* Pain Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Level: {pain}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(e) => setPain(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>No Pain</span>
              <span>Severe Pain</span>
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Medications
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Medication</span>
              </button>
            </div>
            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Time"
                    value={med.time}
                    onChange={(e) => updateMedication(index, 'time', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Any additional notes about your symptoms, activities, etc."
            />
            <p className="text-xs text-gray-500 mt-1">{customNotes.length}/1000 characters</p>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;