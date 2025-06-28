
import React from 'react';
import { TimeSlot } from '../services/appointmentService';
import { Calendar } from 'lucide-react';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (slotId: string) => void;
  loading?: boolean;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlot,
  onSlotSelect,
  loading = false
}) => {
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, slotIndex) => (
                <div key={slotIndex} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {Object.entries(groupedSlots).map(([date, daySlots]) => {
        const { dayName, dayNumber, month } = formatDate(date);
        
        return (
          <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{dayName}</div>
                  <div className="text-sm text-gray-600">{month} {dayNumber}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {daySlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && onSlotSelect(slot.id)}
                  disabled={!slot.available}
                  className={`w-full p-2 text-sm rounded-lg transition-all duration-200 ${
                    !slot.available
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedSlot === slot.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-transparent hover:border-blue-200'
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlotGrid;
