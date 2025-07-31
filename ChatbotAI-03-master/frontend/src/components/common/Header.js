import React, { useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import { MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import AuthModal from '../auth/AuthModal.js';
import ConfirmModal from './ConfirmModal';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">LiveChat Pro</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                    </div>
                    <button onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )  : (
                <div className="hidden md:flex items-center space-x-4">
                  <button onClick={() => handleAuthClick('login')} className="text-gray-700 hover:text-blue-600 transition-colors">
                    Login
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>

              )}
              
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {isMenuOpen && (
  <div className="md:hidden bg-white shadow-md border-b px-4 py-3 space-y-2">
    <Link to="/" className="block text-gray-700 hover:text-blue-600">Home</Link>
    <Link to="/features"  className="block text-gray-700 hover:text-blue-600">Features</Link>
    <Link to="/pricing" className="block text-gray-700 hover:text-blue-600">Pricing</Link>
    {isAuthenticated && (
      <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600">{user?.role === 'sales' ? 'Sales Dashboard' : 'User Dashboard'}</Link>
    )}
    {isAuthenticated ? (
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="block text-red-600 hover:underline"
      >
        Logout
      </button>
    ) : (
      <>
        <button
          onClick={() => handleAuthClick('login')}
          className="block text-gray-700 hover:text-blue-600"
        >
          Login
        </button>
        <button
          onClick={() => handleAuthClick('register')}
          className="block text-blue-600 font-semibold hover:underline"
        >
          Sign Up
        </button>
      </>
    )}
  </div>
)}


      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
      <ConfirmModal
              isOpen={showLogoutConfirm}
              title="Confirm Logout"
              message="Are you sure you want to logout?"
              onConfirm={() => {
                logout();
                setShowLogoutConfirm(false);
                navigate('/'); 
              }}
              onCancel={() => setShowLogoutConfirm(false)}
/>

    </>
  );
};

export default Header;