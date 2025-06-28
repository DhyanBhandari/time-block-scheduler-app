
import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, AlertCircle, Download, Filter } from 'lucide-react';
import BookingsList from '../components/BookingsList';
import { appointmentService, Booking } from '../services/appointmentService';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
    
    // Set up polling for live updates every 10 seconds
    const interval = setInterval(loadBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter bookings when status filter changes
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await appointmentService.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: 'approved' | 'denied') => {
    try {
      setUpdateLoading(true);
      const result = await appointmentService.updateBookingStatus(bookingId, status);
      
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Booking has been ${status}`,
        });
        await loadBookings(); // Refresh bookings
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update booking status",
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
      setUpdateLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await appointmentService.exportBookingsCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Bookings have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export bookings",
        variant: "destructive",
      });
    }
  };

  const getStatusCount = (status: string) => {
    return bookings.filter(booking => booking.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600">Manage customer appointments and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('approved')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('denied')}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={bookings.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {statusFilter === 'all' ? 'All Bookings' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Bookings`}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </span>
          </div>

          <BookingsList
            bookings={filteredBookings}
            onUpdateStatus={handleStatusUpdate}
            loading={loading || updateLoading}
          />
        </div>

        {/* Live Updates Indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">Live Updates Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
