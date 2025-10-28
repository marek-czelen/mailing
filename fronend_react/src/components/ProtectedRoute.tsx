import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pokaż loader podczas sprawdzania statusu autoryzacji
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Sprawdzanie autoryzacji...</p>
      </div>
    );
  }

  // Przekieruj na stronę logowania jeśli nie jest zalogowany
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderuj chroniony komponent
  return <>{children}</>;
};

export default ProtectedRoute;