
// Enhanced backend service with proper date validation and all requested features
export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  slotId: string;
  name: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  date: string;
  time: string;
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  date: string;
  timeSlots: string[];
  isBlocked: boolean;
  reason?: string;
  createdAt: string;
}

// API Response interfaces for better error handling
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

class AppointmentService {
  private bookings: Booking[] = [];
  private slots: TimeSlot[] = [];
  private availabilityRules: AvailabilityRule[] = [];
  private storageKey = 'appointment_bookings';

  constructor() {
    this.loadFromStorage();
    this.generateWeeklySlots();
  }

  // Storage management - simulate local DB
  private saveToStorage() {
    try {
      const data = {
        bookings: this.bookings,
        availabilityRules: this.availabilityRules,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('📁 Data saved to local storage');
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.bookings = data.bookings || [];
        this.availabilityRules = data.availabilityRules || [];
        console.log('📁 Data loaded from local storage');
      }
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  private generateWeeklySlots() {
    const slots: TimeSlot[] = [];
    const now = new Date();
    
    console.log('🕐 Current time:', now.toLocaleString());
    
    // Generate slots for current week and next week
    for (let weekOffset = 0; weekOffset < 2; weekOffset++) {
      const startDate = this.getStartOfWeek();
      startDate.setDate(startDate.getDate() + (weekOffset * 7));
      
      // Generate M-F, 9 AM - 5 PM, 30-min intervals
      for (let day = 0; day < 5; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);
        
        // Only skip completely past dates (not today)
        if (currentDate.toDateString() < now.toDateString()) {
          console.log('⏭️ Skipping past date:', currentDate.toDateString());
          continue;
        }
        
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slotDateTime = new Date(currentDate);
            slotDateTime.setHours(hour, minute, 0, 0);
            
            // For today, check if the time slot has already passed
            const isToday = currentDate.toDateString() === now.toDateString();
            const isPastTime = isToday && slotDateTime <= now;
            
            if (isPastTime) {
              console.log('⏰ Past time slot:', time, 'on', currentDate.toDateString());
            }
            
            slots.push({
              id: `${currentDate.toISOString().split('T')[0]}-${time}`,
              date: currentDate.toISOString().split('T')[0],
              time,
              available: !isPastTime // Mark past times as unavailable
            });
          }
        }
      }
    }
    
    this.slots = slots;
    console.log(`🗓️ Generated ${slots.length} time slots (including today)`);
    console.log(`📅 Today's slots:`, slots.filter(s => s.date === now.toISOString().split('T')[0]).length);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private getStartOfWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  }

  // API Endpoint: GET /slots
  async getAvailableSlots(): Promise<ApiResponse<TimeSlot[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const bookedSlotIds = this.bookings
        .filter(booking => booking.status !== 'denied')
        .map(booking => booking.slotId);
      
      // Apply availability rules
      const blockedSlotIds = new Set<string>();
      this.availabilityRules
        .filter(rule => rule.isBlocked)
        .forEach(rule => {
          rule.timeSlots.forEach(time => {
            const slotId = `${rule.date}-${time}`;
            blockedSlotIds.add(slotId);
          });
        });
      
      const availableSlots = this.slots.map(slot => ({
        ...slot,
        available: slot.available && !bookedSlotIds.includes(slot.id) && !blockedSlotIds.has(slot.id)
      }));

      return {
        success: true,
        data: availableSlots
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to fetch available slots',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // API Endpoint: POST /bookings
  async createBooking(data: {
    slotId: string;
    name: string;
    email: string;
    reason: string;
  }): Promise<ApiResponse<Booking>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Validation - return 400 for missing info
      if (!data.name?.trim()) {
        return {
          success: false,
          error: { code: 400, message: 'Name is required' }
        };
      }

      if (!data.email?.trim()) {
        return {
          success: false,
          error: { code: 400, message: 'Email is required' }
        };
      }

      if (!data.email.includes('@')) {
        return {
          success: false,
          error: { code: 400, message: 'Invalid email address' }
        };
      }

      if (!data.reason?.trim()) {
        return {
          success: false,
          error: { code: 400, message: 'Reason is required' }
        };
      }

      // Check if slot exists
      const slot = this.slots.find(s => s.id === data.slotId);
      if (!slot) {
        return {
          success: false,
          error: { code: 404, message: 'Invalid time slot' }
        };
      }

      // Prevent double-booking - return 409 for booking conflict
      const existingBooking = this.bookings.find(
        booking => booking.slotId === data.slotId && booking.status !== 'denied'
      );
      if (existingBooking) {
        return {
          success: false,
          error: { code: 409, message: 'Time slot is already booked' }
        };
      }

      const booking: Booking = {
        id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        slotId: data.slotId,
        name: data.name.trim(),
        email: data.email.trim(),
        reason: data.reason.trim(),
        status: 'pending',
        date: slot.date,
        time: slot.time,
        createdAt: new Date().toISOString()
      };

      this.bookings.push(booking);
      this.saveToStorage();
      console.log('✅ New booking created:', booking);
      
      return {
        success: true,
        data: booking
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to create booking',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // API Endpoint: GET /bookings
  async getAllBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sortedBookings = [...this.bookings].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        success: true,
        data: sortedBookings
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to fetch bookings',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // API Endpoint: PATCH /bookings/:id
  async updateBookingStatus(
    bookingId: string, 
    status: 'approved' | 'denied'
  ): Promise<ApiResponse<Booking>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const booking = this.bookings.find(b => b.id === bookingId);
      if (!booking) {
        return {
          success: false,
          error: { code: 404, message: 'Booking not found' }
        };
      }

      booking.status = status;
      this.saveToStorage();
      
      // Calendar Sync: Simulate sending email/calendar invite
      if (status === 'approved') {
        this.simulateCalendarInvite(booking);
      }
      
      console.log(`📧 Booking ${bookingId} status updated to: ${status}`);
      
      return {
        success: true,
        data: booking
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to update booking status',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Calendar Sync Simulation
  private simulateCalendarInvite(booking: Booking) {
    const inviteDetails = {
      to: booking.email,
      subject: `Appointment Confirmed - ${booking.date} at ${booking.time}`,
      event: {
        title: `Appointment with ${booking.name}`,
        date: booking.date,
        time: booking.time,
        description: booking.reason,
        attendees: [booking.email],
        location: 'Office/Virtual Meeting'
      }
    };

    console.log('📅 CALENDAR INVITE SENT:', inviteDetails);
    
    // Simulate email notification
    console.log(`📧 EMAIL NOTIFICATION:
      To: ${booking.email}
      Subject: Your appointment has been approved!
      
      Dear ${booking.name},
      
      Your appointment has been approved for:
      📅 Date: ${new Date(booking.date).toLocaleDateString()}
      🕐 Time: ${booking.time}
      📝 Reason: ${booking.reason}
      
      Please save this information and arrive on time.
      
      Best regards,
      Appointment System
    `);
  }

  // CSV Export functionality
  async exportBookingsCSV(): Promise<string> {
    try {
      const headers = [
        'Booking ID', 
        'Name', 
        'Email', 
        'Date', 
        'Time', 
        'Reason', 
        'Status', 
        'Created At'
      ];
      
      const rows = this.bookings.map(booking => [
        booking.id,
        booking.name,
        booking.email,
        booking.date,
        booking.time,
        `"${booking.reason.replace(/"/g, '""')}"`, // Escape quotes in CSV
        booking.status,
        new Date(booking.createdAt).toLocaleString()
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

      console.log('📊 CSV Export generated successfully');
      return csvContent;
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw new Error('CSV export failed');
    }
  }

  // Availability management methods
  async setAvailability(data: {
    date: string;
    timeSlots: string[];
    isBlocked: boolean;
    reason?: string;
  }): Promise<ApiResponse<AvailabilityRule>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove existing rule for the same date
      this.availabilityRules = this.availabilityRules.filter(rule => rule.date !== data.date);

      const rule: AvailabilityRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: data.date,
        timeSlots: data.timeSlots,
        isBlocked: data.isBlocked,
        reason: data.reason,
        createdAt: new Date().toISOString()
      };

      this.availabilityRules.push(rule);
      this.saveToStorage();
      console.log('⚙️ Availability rule created:', rule);
      
      return {
        success: true,
        data: rule
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to set availability',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getAvailabilityRules(): Promise<ApiResponse<AvailabilityRule[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const sortedRules = [...this.availabilityRules].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        success: true,
        data: sortedRules
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to fetch availability rules',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async deleteAvailabilityRule(ruleId: string): Promise<ApiResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const ruleIndex = this.availabilityRules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex === -1) {
        return {
          success: false,
          error: { code: 404, message: 'Availability rule not found' }
        };
      }

      this.availabilityRules.splice(ruleIndex, 1);
      this.saveToStorage();
      console.log('🗑️ Availability rule deleted:', ruleId);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 500,
          message: 'Failed to delete availability rule',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Test methods for basic testing
  async runBasicTests(): Promise<void> {
    console.log('🧪 Running basic API tests...');

    try {
      // Test 1: Create booking with missing data should return 400
      const invalidBooking = await this.createBooking({
        slotId: 'test-slot',
        name: '',
        email: '',
        reason: ''
      });
      
      if (invalidBooking.error?.code === 400) {
        console.log('✅ Test 1 PASSED: Missing data returns 400');
      } else {
        console.log('❌ Test 1 FAILED: Should return 400 for missing data');
      }

      // Test 2: Double booking should return 409
      const validSlot = this.slots[0];
      if (validSlot) {
        const firstBooking = await this.createBooking({
          slotId: validSlot.id,
          name: 'Test User 1',
          email: 'test1@example.com',
          reason: 'Test appointment'
        });

        const doubleBooking = await this.createBooking({
          slotId: validSlot.id,
          name: 'Test User 2',
          email: 'test2@example.com',
          reason: 'Another test'
        });

        if (doubleBooking.error?.code === 409) {
          console.log('✅ Test 2 PASSED: Double booking returns 409');
        } else {
          console.log('❌ Test 2 FAILED: Should return 409 for double booking');
        }
      }

      console.log('🧪 Basic tests completed');
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }
}

export const appointmentService = new AppointmentService();

// Run basic tests on startup
setTimeout(() => appointmentService.runBasicTests(), 1000);
