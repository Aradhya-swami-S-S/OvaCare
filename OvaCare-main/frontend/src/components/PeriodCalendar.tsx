import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Period {
  _id: string;
  startDate: string;
  endDate: string | null;
  predictedNextDate: string;
  isActive: boolean;
}

interface PeriodData {
  currentCycle: Period | null;
  pastCycles: Period[];
  nextPredictedDate: string | null;
}

interface PeriodCalendarProps {
  periodData: PeriodData;
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({ periodData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isPeriodDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check current cycle
    if (periodData.currentCycle) {
      const start = new Date(periodData.currentCycle.startDate);
      const end = periodData.currentCycle.endDate 
        ? new Date(periodData.currentCycle.endDate) 
        : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000); // Assume 5 days if no end date
      
      if (date >= start && date <= end) {
        return true;
      }
    }

    // Check past cycles
    for (const cycle of periodData.pastCycles) {
      const start = new Date(cycle.startDate);
      const end = cycle.endDate 
        ? new Date(cycle.endDate) 
        : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);
      
      if (date >= start && date <= end) {
        return true;
      }
    }

    return false;
  };

  const isPredictedPeriod = (date: Date) => {
    if (!periodData.nextPredictedDate) return false;
    
    const predicted = new Date(periodData.nextPredictedDate);
    const predictedEnd = new Date(predicted.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    return date >= predicted && date <= predictedEnd;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-12"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isPeriod = isPeriodDay(date);
    const isPredicted = isPredictedPeriod(date);
    const today = isToday(date);

    days.push(
      <div
        key={day}
        className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
          isPeriod
            ? 'bg-red-100 text-red-900'
            : isPredicted
            ? 'bg-purple-100 text-purple-900'
            : 'text-gray-700'
        } ${
          today ? 'ring-2 ring-purple-600 ring-offset-2' : ''
        }`}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span className="text-gray-600">Period Days</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 rounded"></div>
          <span className="text-gray-600">Predicted Period</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-purple-600 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
};

export default PeriodCalendar;