
import React from 'react';
import { User, Mail, Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Booking } from '../services/appointmentService';

interface BookingsListProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: 'approved' | 'denied') => void;
  loading?: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  onUpdateStatus,
  loading = false
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'denied':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
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
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-500">Customer bookings will appear here when they make appointments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon(booking.status)}
              <div>
                <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {booking.email}
                </p>
              </div>
            </div>
            <span className={getStatusBadge(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(booking.date)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(booking.time)}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-start text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="italic">{booking.reason}</span>
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onUpdateStatus(booking.id, 'approved')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                disabled={loading}
              >
                Approve
              </button>
              <button
                onClick={() => onUpdateStatus(booking.id, 'denied')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
                disabled={loading}
              >
                Deny
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Booked on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingsList;
