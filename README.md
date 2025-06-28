
# 🚀 Appointment Booking System

A modern, full-featured appointment booking application built with React, TypeScript, and Tailwind CSS. This system provides both customer-facing booking functionality and an admin dashboard for managing appointments.

## ✨ Features

### Customer Side
- 📅 View available time slots for the current week (Monday-Friday, 9 AM-5 PM)
- ⏰ 30-minute appointment intervals
- 📝 Easy booking form with name, email, and reason
- ✅ Real-time slot availability updates
- 🚫 Prevents double-booking with clear error messages

### Admin Dashboard
- 👥 View all customer bookings with detailed information
- ⏳ Manage booking status (Pending → Approved/Denied)
- 🔍 Filter bookings by status (All, Pending, Approved, Denied)
- 📊 Live statistics dashboard
- 📄 Export bookings to CSV format
- 🔄 Real-time updates (polling every 10 seconds)
- 📧 Simulated calendar invite notifications

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Hooks
- **UI Components**: Custom components with shadcn/ui integration
- **Notifications**: Toast notifications
- **Styling**: Tailwind CSS with custom gradients and animations

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # App navigation bar
│   ├── TimeSlotGrid.tsx # Calendar-style time slot display
│   ├── BookingForm.tsx  # Customer booking form modal
│   └── BookingsList.tsx # Admin bookings management
├── pages/              # Main application pages
│   ├── CustomerBooking.tsx # Customer booking interface
│   └── AdminDashboard.tsx  # Admin management dashboard
├── services/           # Business logic and data management
│   └── appointmentService.ts # Mock backend service
└── hooks/             # Custom React hooks
    └── use-toast.ts   # Toast notification hook
```

### Data Flow
1. **appointmentService.ts** simulates a backend API with in-memory data storage
2. Components communicate through service methods
3. Real-time updates achieved through polling
4. State management handled with React hooks

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appointment-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 📖 Usage Guide

### For Customers
1. Visit the home page to see available time slots
2. Click on any available (green) time slot
3. Fill in your details in the booking form:
   - Full name
   - Email address
   - Reason for appointment
4. Submit your booking request
5. Your appointment will be marked as "Pending" until admin approval

### For Admins
1. Navigate to `/admin` or click "Admin Dashboard" in the navigation
2. View all bookings with status indicators
3. Use the filter dropdown to view specific booking statuses
4. Approve or deny pending bookings using the action buttons
5. Export all bookings to CSV using the "Export CSV" button
6. Monitor live statistics in the dashboard cards

## 🔧 API Simulation

The application uses a mock service (`appointmentService.ts`) that simulates these REST endpoints:

- `GET /slots` - Retrieve available time slots
- `POST /bookings` - Create new booking
- `GET /bookings` - Get all bookings
- `PATCH /bookings/:id` - Update booking status

### Error Handling
- **400**: Missing required information
- **409**: Time slot already booked
- **404**: Invalid booking ID
- **Validation**: Email format, required fields

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Fully responsive design works on all devices
- **Interactive**: Smooth hover effects and transitions
- **Accessible**: Proper contrast ratios and semantic HTML
- **Visual Feedback**: Toast notifications and loading states
- **Status Indicators**: Color-coded booking statuses

## 🔄 Real-time Features

- **Live Updates**: Admin dashboard polls for new bookings every 10 seconds
- **Instant Feedback**: Immediate UI updates after actions
- **Status Synchronization**: Real-time booking status changes
- **Calendar Simulation**: Console logs simulate email/calendar invites

## 📊 Data Management

### Time Slot Generation
- Automatically generates weekly slots (Monday-Friday)
- 9 AM to 5 PM time range
- 30-minute intervals
- Smart availability tracking

### Booking Management
- Unique booking IDs
- Timestamp tracking
- Status workflow: Pending → Approved/Denied
- Conflict prevention

## 🚀 Deployment

This is a client-side application that can be deployed to any static hosting service:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service of choice:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static hosting provider

## 🔮 Future Enhancements

- **Real Backend**: Replace mock service with actual REST API
- **Authentication**: Add user authentication and authorization
- **Email Integration**: Real email notifications and calendar invites
- **Multiple Services**: Support for different appointment types
- **Recurring Appointments**: Support for recurring bookings
- **Calendar Integration**: Direct calendar sync
- **Payment Integration**: Add payment processing for paid services
- **Mobile App**: React Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
