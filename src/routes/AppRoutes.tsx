import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import ProductIdentification from '../pages/ProductIdentification';
import QRScanner from '../pages/QRScanner';
import Reports from '../pages/Reports';
import SalesReports from '../pages/SalesReports';
import Settings from '../pages/Settings';
import StockManagement from '../pages/StockManagement';
import SubmittedResults from '../pages/SubmittedResults';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Enterprise Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock-management" element={<StockManagement />} />
        <Route path="/product-identification" element={<ProductIdentification />} />
        <Route path="/sales-reports" element={<SalesReports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />

        {/* Supporting routes */}
        <Route path="/qr-scan" element={<QRScanner />} />
        <Route path="/submitted-results" element={<SubmittedResults />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
