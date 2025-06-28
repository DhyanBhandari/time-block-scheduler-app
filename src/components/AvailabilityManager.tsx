import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, X } from 'lucide-react';
import { appointmentService, AvailabilityRule } from '../services/appointmentService';
import { useToast } from '../hooks/use-toast';

const AvailabilityManager = () => {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    selectedTimes: new Set<string>(),
    isBlocked: true,
    reason: ''
  });
  const { toast } = useToast();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAvailabilityRules();
      if (response.success && response.data) {
        setRules(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to load availability rules",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load availability rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotToggle = (time: string) => {
    const newSelectedTimes = new Set(formData.selectedTimes);
    if (newSelectedTimes.has(time)) {
      newSelectedTimes.delete(time);
    } else {
      newSelectedTimes.add(time);
    }
    setFormData({ ...formData, selectedTimes: newSelectedTimes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || formData.selectedTimes.size === 0) {
      toast({
        title: "Error",
        description: "Please select a date and at least one time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await appointmentService.setAvailability({
        date: formData.date,
        timeSlots: Array.from(formData.selectedTimes),
        isBlocked: formData.isBlocked,
        reason: formData.reason
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Availability ${formData.isBlocked ? 'blocked' : 'set'} successfully`,
        });
        setShowForm(false);
        setFormData({
          date: '',
          selectedTimes: new Set(),
          isBlocked: true,
          reason: ''
        });
        await loadRules();
      } else {
        toast({
          title: "Error",
          description: typeof result.error === 'string' ? result.error : result.error?.message || "Failed to set availability",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const result = await appointmentService.deleteAvailabilityRule(ruleId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Availability rule deleted successfully",
        });
        await loadRules();
      } else {
        toast({
          title: "Error",
          description: typeof result.error === 'string' ? result.error : result.error?.message || "Failed to delete rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
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

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Availability Management</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Set Availability</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No availability rules set yet</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{formatDate(rule.date)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {rule.isBlocked ? 'Blocked' : 'Available'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {rule.timeSlots.map((time) => (
                        <span 
                          key={time} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {formatTime(time)}
                        </span>
                      ))}
                    </div>
                    
                    {rule.reason && (
                      <p className="text-sm text-gray-600 italic">{rule.reason}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Set Availability</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    min={getMinDate()}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.isBlocked}
                        onChange={() => setFormData({ ...formData, isBlocked: true })}
                        className="mr-2"
                      />
                      Block Time Slots
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.isBlocked}
                        onChange={() => setFormData({ ...formData, isBlocked: false })}
                        className="mr-2"
                      />
                      Set Available
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slots
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSlotToggle(time)}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                          formData.selectedTimes.has(time)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter reason for blocking/setting availability"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Availability
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
