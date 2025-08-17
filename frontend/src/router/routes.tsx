import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';
import { Layout } from '@components/Layout';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Agents from '@pages/Agents';
import Workflows from '@pages/Workflows';
import Queue from '@pages/Queue';
import Settings from '@pages/Settings';
import Companies from '@pages/Companies';
import NotFound from '@pages/NotFound';
import { ROUTES } from './constants';

/**
 * Main application routes
 * 
 * Structure:
 * - Public routes: Login, Register
 * - Protected routes: All authenticated pages wrapped in Layout
 * - Nested routing: Dashboard, Agents, Workflows, Queue, Settings
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      
      {/* Protected Routes - Authentication required */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard is the index route */}
        <Route index element={<Dashboard />} />
        
        {/* Feature routes */}
        <Route path="agents" element={<Agents />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="queue" element={<Queue />} />
        <Route path="settings" element={<Settings />} />
        <Route path="companies" element={<Companies />} />
        
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
