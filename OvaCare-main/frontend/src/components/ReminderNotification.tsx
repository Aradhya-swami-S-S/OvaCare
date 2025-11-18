import React from 'react';
import { Bell, X } from 'lucide-react';

interface Reminder {
  type: string;
  message: string;
  date: string;
  periodId: string;
}

interface ReminderNotificationProps {
  reminder: Reminder;
  onDismiss: () => void;
}

const ReminderNotification: React.FC<ReminderNotificationProps> = ({ reminder, onDismiss }) => {
  const isUrgent = reminder.type === 'on-day';

  return (
    <div className={`mb-4 p-4 rounded-lg border ${
      isUrgent 
        ? 'bg-red-50 border-red-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Bell className={`h-5 w-5 mt-0.5 ${
            isUrgent ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div>
            <h4 className={`font-semibold ${
              isUrgent ? 'text-red-900' : 'text-yellow-900'
            }`}>
              Period Reminder
            </h4>
            <p className={`text-sm ${
              isUrgent ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {reminder.message}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={`p-1 rounded hover:bg-opacity-20 ${
            isUrgent 
              ? 'hover:bg-red-200 text-red-600' 
              : 'hover:bg-yellow-200 text-yellow-600'
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ReminderNotification;