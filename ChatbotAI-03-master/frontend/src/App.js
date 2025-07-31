import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.js';
import { ChatProvider } from './context/ChatContext.js';
import Header from './components/common/Header.js';
import Dashboard from './components/dashboard/Dashboard.js'
import ChatWidget from './components/chat/EnhancedChatWidget.js';
import './index.css';
import FeaturePage from './components/pages/FeaturePage.js';
import PricingPage from './components/pages/PricingPage.js';
import HomePage from './components/pages/HomePage.js';


function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/features" element={<FeaturePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                 
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            
            <ChatWidget />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}


export default App;