import React, { useState } from 'react';
import './LoginForm.css';
import config from '../config';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading = false }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Adres email jest wymagany';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Podaj prawidłowy adres email';
    }

    // W wersji developerskiej wyłącz walidację hasła
    if (!config.isDevelopment) {
      if (!formData.password.trim()) {
        newErrors.password = 'Hasło jest wymagane';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
      }
    } else {
      // W development wymagaj tylko niepustego hasła
      if (!formData.password.trim()) {
        newErrors.password = 'Hasło jest wymagane (w dev można użyć dowolnego)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Wyczyść błędy dla tego pola
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onLogin(formData.email, formData.password);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Wystąpił błąd podczas logowania'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Logowanie</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adres email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Wprowadź swój adres email"
              disabled={isSubmitting || isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Hasło {config.isDevelopment && <span className="dev-info">(tryb dev)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={config.isDevelopment ? "Dowolne hasło (tryb dev)" : "Wprowadź swoje hasło"}
              disabled={isSubmitting || isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {config.isDevelopment && !errors.password && (
              <span className="dev-message">Walidacja hasła wyłączona w trybie deweloperskim</span>
            )}
          </div>

          <button
            type="submit"
            className={`login-button ${isSubmitting || isLoading ? 'loading' : ''}`}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        
        <div className="login-footer">
          <a href="#forgot-password" className="forgot-password-link">
            Zapomniałeś hasła?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;