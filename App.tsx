
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgentDetailPage from './pages/AgentDetailPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-dark-bg">
            <div className="w-16 h-16 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin"></div>
        </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <DashboardPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/agent/:id" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <AgentDetailPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/settings" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            <SettingsPage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
