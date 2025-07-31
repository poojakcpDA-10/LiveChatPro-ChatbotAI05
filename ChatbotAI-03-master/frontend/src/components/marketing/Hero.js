import React, { useState } from 'react';
import { MessageCircle, Play, CheckCircle } from 'lucide-react';
import AuthModal from '../auth/AuthModal.js';

const Hero = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Customer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                Conversations
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Engage your customers with real-time live chat, boost sales, and provide 
              exceptional support with our advanced chat platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
              >
                Start Free Trial
              </button>
              <button className="flex items-center space-x-2 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="register"
        onToggleMode={() => {}}
      />
    </>
  );
};

export default Hero;