import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Settings, RotateCcw, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import AddNoteModal from './AddNoteModal';
import SetTrackerModal from './SetTrackerModal';
import ResetConfirmModal from './ResetConfirmModal';
import CycleTimeline from './CycleTimeline';
import PeriodCalendar from './PeriodCalendar';
import ReminderNotification from './ReminderNotification';

interface Period {
    _id: string;
    startDate: string;
    endDate: string | null;
    cycleLength: number | null;
    predictedNextDate: string;
    isActive: boolean;
}

interface PeriodData {
    currentCycle: Period | null;
    pastCycles: Period[];
    averageCycleLength: number;
    nextPredictedDate: string | null;
    currentCycleDay: number | null;
}

interface Reminder {
    type: string;
    message: string;
    date: string;
    periodId: string;
}

const PeriodTracker: React.FC = () => {
    const [periodData, setPeriodData] = useState<PeriodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddNote, setShowAddNote] = useState(false);
    const [showSetTracker, setShowSetTracker] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const { token } = useAuth();

    const API_BASE_URL = 'http://localhost:5000';

    // Fetch period data
    const fetchPeriodData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/period/cycles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPeriodData(response.data);
            setError('');
        } catch (err: any) {
            console.error('Error fetching period data:', err);
            setError(err.response?.data?.error || 'Failed to load period data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch reminders
    const fetchReminders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/period/reminders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(response.data.reminders || []);
        } catch (err) {
            console.error('Error fetching reminders:', err);
        }
    };

    useEffect(() => {
        fetchPeriodData();
        fetchReminders();
    }, [token]);

    const calculateDaysUntilNext = () => {
        if (!periodData?.nextPredictedDate) return null;

        const today = new Date();
        const nextDate = new Date(periodData.nextPredictedDate);
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const handleDismissReminder = async (reminder: Reminder) => {
        try {
            await axios.post(
                `${API_BASE_URL}/api/period/reminders/dismiss`,
                { periodId: reminder.periodId, type: reminder.type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReminders(reminders.filter(r => r.type !== reminder.type));
        } catch (err) {
            console.error('Error dismissing reminder:', err);
        }
    };

    const daysUntilNext = calculateDaysUntilNext();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Period Tracker</h1>
                </div>
                <p className="text-gray-600">Track your menstrual cycle and manage your health</p>
            </div>

            {/* Reminders */}
            {reminders.map((reminder, index) => (
                <ReminderNotification
                    key={index}
                    reminder={reminder}
                    onDismiss={() => handleDismissReminder(reminder)}
                />
            ))}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Current Cycle Info */}
            {periodData?.currentCycle ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Cycle</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-medium mb-1">Cycle Day</p>
                            <p className="text-3xl font-bold text-purple-900">
                                {periodData.currentCycleDay || '-'}
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600 font-medium mb-1">Days Until Next Period</p>
                            <p className="text-3xl font-bold text-blue-900">
                                {daysUntilNext !== null ? daysUntilNext : '-'}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-medium mb-1">Average Cycle Length</p>
                            <p className="text-3xl font-bold text-green-900">
                                {periodData.averageCycleLength} days
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Tracking Your Cycle</h3>
                    <p className="text-gray-600 mb-4">
                        Begin by setting your last period start date to start tracking your menstrual cycle.
                    </p>
                    <button
                        onClick={() => setShowSetTracker(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Set Tracker
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            {periodData?.currentCycle && (
                <div className="flex flex-wrap gap-4 mb-6">
                    <button
                        onClick={() => setShowAddNote(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Add Note</span>
                    </button>
                    <button
                        onClick={() => setShowSetTracker(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Set Tracker</span>
                    </button>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RotateCcw className="h-5 w-5" />
                        <span>Reset Tracker</span>
                    </button>
                </div>
            )}

            {/* Calendar View */}
            {periodData?.currentCycle && (
                <div className="mb-6">
                    <PeriodCalendar periodData={periodData} />
                </div>
            )}

            {/* Cycle Timeline */}
            {periodData && periodData.pastCycles.length > 0 && (
                <CycleTimeline
                    cycles={periodData.pastCycles}
                    onRefresh={fetchPeriodData}
                />
            )}

            {/* Modals */}
            {showAddNote && periodData?.currentCycle && (
                <AddNoteModal
                    periodId={periodData.currentCycle._id}
                    onClose={() => setShowAddNote(false)}
                    onSuccess={() => {
                        setShowAddNote(false);
                        fetchPeriodData();
                    }}
                />
            )}

            {showSetTracker && (
                <SetTrackerModal
                    onClose={() => setShowSetTracker(false)}
                    onSuccess={() => {
                        setShowSetTracker(false);
                        fetchPeriodData();
                        fetchReminders();
                    }}
                />
            )}

            {showResetConfirm && (
                <ResetConfirmModal
                    onClose={() => setShowResetConfirm(false)}
                    onSuccess={() => {
                        setShowResetConfirm(false);
                        fetchPeriodData();
                        setReminders([]);
                    }}
                />
            )}
        </div>
    );
};

export default PeriodTracker;