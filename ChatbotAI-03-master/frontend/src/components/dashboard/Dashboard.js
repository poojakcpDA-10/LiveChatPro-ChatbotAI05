import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import UserDashboard from './UserDashboard';
// import SalesDashboard from './SalesDashboard';
import { Navigate } from 'react-router-dom';
import SalesDashboard from '../../pages/SalesDashboardPage.js';


const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
  console.log("User:", user);
console.log("Loading:", loading);

  
  if (!user) return <Navigate to="/" />;

  // Route to appropriate dashboard based on user role
  if (user.role === 'sales' || user.role === 'salesperson') {
    return <SalesDashboard />;
  }
  
  if (user.role === 'user') {
    return <UserDashboard />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;