import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bauhaus-bg">
        <div className="text-2xl font-bold uppercase tracking-widest text-bauhaus-black animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!currentUser || !userProfile || userProfile.role !== 'freelancer') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
