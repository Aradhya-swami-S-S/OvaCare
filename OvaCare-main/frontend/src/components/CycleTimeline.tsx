import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Period {
  _id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
}

interface PeriodNote {
  _id: string;
  date: string;
  symptoms: {
    cramps: string;
    flow: string;
    mood: string;
    pain: number;
  };
  medications: Array<{ name: string; dosage: string; time: string }>;
  customNotes: string;
}

interface CycleTimelineProps {
  cycles: Period[];
  onRefresh: () => void;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({ cycles, onRefresh }) => {
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const [cycleNotes, setCycleNotes] = useState<{ [key: string]: PeriodNote[] }>({});
  const [loadingNotes, setLoadingNotes] = useState<{ [key: string]: boolean }>({});
  const { token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  const fetchNotesForCycle = async (periodId: string) => {
    if (cycleNotes[periodId]) {
      // Already loaded
      return;
    }

    setLoadingNotes(prev => ({ ...prev, [periodId]: true }));
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/period/notes/${periodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCycleNotes(prev => ({ ...prev, [periodId]: response.data.notes }));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(prev => ({ ...prev, [periodId]: false }));
    }
  };

  const toggleCycle = (periodId: string) => {
    if (expandedCycle === periodId) {
      setExpandedCycle(null);
    } else {
      setExpandedCycle(periodId);
      fetchNotesForCycle(periodId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSymptomIcon = (symptom: string, value: any) => {
    if (symptom === 'cramps' && value !== 'none') return '🤕';
    if (symptom === 'flow') {
      if (value === 'heavy') return '🔴';
      if (value === 'medium') return '🟠';
      if (value === 'light') return '🟡';
      if (value === 'spotting') return '⚪';
    }
    if (symptom === 'mood') {
      if (value === 'happy') return '😊';
      if (value === 'sad') return '😢';
      if (value === 'irritable') return '😠';
      if (value === 'anxious') return '😰';
    }
    if (symptom === 'pain' && value > 0) return '⚡';
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cycle History</h2>
      
      <div className="space-y-3">
        {cycles.map((cycle, index) => {
          const isExpanded = expandedCycle === cycle._id;
          const notes = cycleNotes[cycle._id] || [];
          const isLoading = loadingNotes[cycle._id];

          return (
            <div key={cycle._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Cycle Header */}
              <button
                onClick={() => toggleCycle(cycle._id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Cycle {cycles.length - index}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(cycle.startDate)}
                      {cycle.endDate && ` - ${formatDate(cycle.endDate)}`}
                      {cycle.cycleLength && ` (${cycle.cycleLength} days)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {notes.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Notes */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {isLoading ? (
                    <p className="text-center text-gray-500">Loading notes...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-center text-gray-500">No notes for this cycle</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note._id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(note.date)}
                            </p>
                          </div>
                          
                          {/* Symptoms */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {note.symptoms.cramps !== 'none' && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                {getSymptomIcon('cramps', note.symptoms.cramps)} {note.symptoms.cramps} cramps
                              </span>
                            )}
                            {note.symptoms.flow && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {getSymptomIcon('flow', note.symptoms.flow)} {note.symptoms.flow} flow
                              </span>
                            )}
                            {note.symptoms.mood !== 'neutral' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                {getSymptomIcon('mood', note.symptoms.mood)} {note.symptoms.mood}
                              </span>
                            )}
                            {note.symptoms.pain > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                {getSymptomIcon('pain', note.symptoms.pain)} Pain: {note.symptoms.pain}/10
                              </span>
                            )}
                          </div>

                          {/* Medications */}
                          {note.medications.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-gray-700 mb-1">Medications:</p>
                              <div className="space-y-1">
                                {note.medications.map((med, idx) => (
                                  <p key={idx} className="text-xs text-gray-600">
                                    💊 {med.name} {med.dosage && `- ${med.dosage}`} {med.time && `at ${med.time}`}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom Notes */}
                          {note.customNotes && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                              <p className="text-sm text-gray-600">{note.customNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CycleTimeline;