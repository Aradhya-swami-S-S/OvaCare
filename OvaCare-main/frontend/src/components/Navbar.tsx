import React, { useState } from 'react';
import { Heart, User, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">OvaCare</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/detection" className="text-gray-700 hover:text-purple-600 transition-colors">
              Detection
            </Link>
            <Link to="/diet-plans" className="text-gray-700 hover:text-purple-600 transition-colors">
              Diet Plans
            </Link>
            <Link to="/diet-tracker" className="text-gray-700 hover:text-purple-600 transition-colors">
              Diet Tracker
            </Link>
            <Link to="/tracker" className="text-gray-700 hover:text-purple-600 transition-colors">
              Period Tracker
            </Link>
            
            {/* Community Chat Button - Navigate to full-page chat */}
            {user && (
              <Link
                to="/community-chat"
                className="relative flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Community</span>
                {/* Simple connection indicator without user counts */}
                <div className={`absolute -bottom-1 right-0 w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </Link>
            )}
            
            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/detection"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Detection
              </Link>
              <Link
                to="/diet-plans"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Diet Plans
              </Link>
              <Link
                to="/diet-tracker"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Diet Tracker
              </Link>
              <Link
                to="/tracker"
                className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Period Tracker
              </Link>
              
              {/* Mobile Community Chat Button - Navigate to full-page chat */}
              {user && (
                <Link
                  to="/community-chat"
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Community Chat
                </Link>
              )}
              
              {user && (
                <div className="border-t pt-2">
                  <div className="px-3 py-2 text-sm text-gray-700">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;