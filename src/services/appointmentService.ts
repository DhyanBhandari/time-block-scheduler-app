// Mock backend service to simulate API calls
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

class AppointmentService {
  private bookings: Booking[] = [];
  private slots: TimeSlot[] = [];
  private availabilityRules: AvailabilityRule[] = [];

  constructor() {
    this.generateWeeklySlots();
  }

  private generateWeeklySlots() {
    const slots: TimeSlot[] = [];
    const startDate = this.getStartOfWeek();
    
    // Generate M-F, 9 AM - 5 PM, 30-min intervals
    for (let day = 0; day < 5; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            id: `${currentDate.toISOString().split('T')[0]}-${time}`,
            date: currentDate.toISOString().split('T')[0],
            time,
            available: true
          });
        }
      }
    }
    
    this.slots = slots;
  }

  private getStartOfWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(today.setDate(diff));
  }

  async getAvailableSlots(): Promise<TimeSlot[]> {
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
    
    return this.slots.map(slot => ({
      ...slot,
      available: !bookedSlotIds.includes(slot.id) && !blockedSlotIds.has(slot.id)
    }));
  }

  async createBooking(data: {
    slotId: string;
    name: string;
    email: string;
    reason: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validation
    if (!data.name || !data.email || !data.reason) {
      return { success: false, error: 'Missing required information' };
    }

    if (!data.email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    // Check if slot exists and is available
    const slot = this.slots.find(s => s.id === data.slotId);
    if (!slot) {
      return { success: false, error: 'Invalid time slot' };
    }

    // Check for conflicts
    const existingBooking = this.bookings.find(
      booking => booking.slotId === data.slotId && booking.status !== 'denied'
    );
    if (existingBooking) {
      return { success: false, error: 'Time slot is already booked' };
    }

    const booking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slotId: data.slotId,
      name: data.name,
      email: data.email,
      reason: data.reason,
      status: 'pending',
      date: slot.date,
      time: slot.time,
      createdAt: new Date().toISOString()
    };

    this.bookings.push(booking);
    console.log('New booking created:', booking);
    
    return { success: true, booking };
  }

  async getAllBookings(): Promise<Booking[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...this.bookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateBookingStatus(
    bookingId: string, 
    status: 'approved' | 'denied'
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    booking.status = status;
    
    if (status === 'approved') {
      console.log(`📅 Calendar invite sent to ${booking.email} for ${booking.date} at ${booking.time}`);
    }
    
    console.log(`Booking ${bookingId} status updated to: ${status}`);
    
    return { success: true, booking };
  }

  async exportBookingsCSV(): Promise<string> {
    const headers = ['ID', 'Name', 'Email', 'Date', 'Time', 'Reason', 'Status', 'Created At'];
    const rows = this.bookings.map(booking => [
      booking.id,
      booking.name,
      booking.email,
      booking.date,
      booking.time,
      booking.reason,
      booking.status,
      new Date(booking.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    console.log('CSV Export generated');
    return csvContent;
  }

  // New availability management methods
  async setAvailability(data: {
    date: string;
    timeSlots: string[];
    isBlocked: boolean;
    reason?: string;
  }): Promise<{ success: boolean; rule?: AvailabilityRule; error?: string }> {
    // Simulate API delay
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
    console.log('Availability rule created:', rule);
    
    return { success: true, rule };
  }

  async getAvailabilityRules(): Promise<AvailabilityRule[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [...this.availabilityRules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async deleteAvailabilityRule(ruleId: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const ruleIndex = this.availabilityRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) {
      return { success: false, error: 'Availability rule not found' };
    }

    this.availabilityRules.splice(ruleIndex, 1);
    console.log('Availability rule deleted:', ruleId);
    
    return { success: true };
  }
}

export const appointmentService = new AppointmentService();
