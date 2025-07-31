import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SalesProvider } from '../context/SalesContext';
import SalesDashboard from '../components/sales/SalesDashboard';

const SalesDashboardPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sales-login" replace />;
  }

  if (user?.role !== 'sales') {
    return <Navigate to="/" replace />;
  }

  return (
    <SalesProvider>
      <SalesDashboard />
    </SalesProvider>
  );
};

export default SalesDashboardPage;