import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Dashboard from '../pages/Dashboard/Dashboard';
import EmployeeDirectory from '../pages/Employees/EmployeeDirectory';
import SessionReports from '../pages/Sessions/SessionReports';
import Analytics from '../pages/Reports/Analytics';
import Settings from '../pages/Settings/Settings';
import Login from '../pages/Auth/Login';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<EmployeeDirectory />} />
        <Route path="sessions" element={<SessionReports />} />
        <Route path="reports" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
