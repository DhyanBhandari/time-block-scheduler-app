
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import TimeSlotGrid from '../components/TimeSlotGrid';
import BookingForm from '../components/BookingForm';
import { appointmentService, TimeSlot } from '../services/appointmentService';
import { useToast } from '../hooks/use-toast';

const CustomerBooking = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const availableSlots = await appointmentService.getAvailableSlots();
      setSlots(availableSlots);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setShowForm(true);
  };

  const handleBookingSubmit = async (data: { name: string; email: string; reason: string }) => {
    if (!selectedSlot) return;

    try {
      setBookingLoading(true);
      const result = await appointmentService.createBooking({
        slotId: selectedSlot,
        ...data
      });

      if (result.success) {
        toast({
          title: "Booking Successful!",
          description: "Your appointment has been booked and is pending approval.",
        });
        setShowForm(false);
        setSelectedSlot(null);
        await loadSlots(); // Refresh slots
      } else {
        toast({
          title: "Booking Failed",
          description: result.error || "Failed to book appointment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedSlot(null);
  };

  const selectedSlotData = selectedSlot ? slots.find(slot => slot.id === selectedSlot) : null;
  const availableSlots = slots.filter(slot => slot.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 mb-2">Choose from available time slots this week</p>
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Available
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
              Booked
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold text-green-600">{availableSlots.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-blue-600">{slots.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booked Slots</p>
                <p className="text-2xl font-bold text-orange-600">{slots.length - availableSlots.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Time Slot Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Your Preferred Time</h2>
          <TimeSlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            loading={loading}
          />
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Select an available time slot from the calendar above</p>
              <p>2. Fill in your details and reason for appointment</p>
              <p>3. Submit your booking request for admin approval</p>
              <p>4. You'll receive confirmation once approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && selectedSlotData && (
        <BookingForm
          selectedSlot={selectedSlotData}
          onSubmit={handleBookingSubmit}
          onCancel={handleFormCancel}
          loading={bookingLoading}
        />
      )}
    </div>
  );
};

export default CustomerBooking;
