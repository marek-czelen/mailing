import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TemplateProvider } from './contexts/TemplateContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TemplatePage from './pages/TemplatePage';
import './App.css';
import './components/Loading.css';

function App() {
  return (
    <AuthProvider>
      <TemplateProvider>
        <Router>
          <div className="App">
            <Routes>
            {/* Przekierowanie z głównej strony na dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Strona logowania */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Chronione trasy */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <TemplatePage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route - przekierowuje na dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </TemplateProvider>
    </AuthProvider>
  );
}

export default App;
