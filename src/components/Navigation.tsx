
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BookingApp</span>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>

              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/admin') 
                    ? 'bg-purple-50 text-purple-700 font-medium' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
