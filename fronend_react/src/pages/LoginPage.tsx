import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();

  // Przekieruj na dashboard jeśli już zalogowany
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pokaż loader podczas sprawdzania autoryzacji
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Sprawdzanie autoryzacji...</p>
      </div>
    );
  }

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;