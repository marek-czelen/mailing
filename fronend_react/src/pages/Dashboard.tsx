import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Błąd podczas wylogowania:', error);
        // Wyloguj lokalnie nawet jeśli wystąpił błąd
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Panel Mailingowy</h1>
          <div className="user-info">
            <span className="welcome-text">
              Witaj, {user?.firstName || user?.email}!
            </span>
            <button 
              onClick={handleLogout}
              className="logout-button"
              type="button"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Kampanie mailingowe</h3>
            <p>Zarządzaj swoimi kampaniami email</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Aktywnych kampanii</span>
            </div>
            <button className="card-button">Utwórz kampanię</button>
          </div>

          <div className="dashboard-card">
            <h3>Lista kontaktów</h3>
            <p>Zarządzaj bazą odbiorców</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Kontaktów</span>
            </div>
            <button className="card-button">Dodaj kontakty</button>
          </div>

          <div className="dashboard-card">
            <h3>Szablony email</h3>
            <p>Twórz i edytuj szablony</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Szablonów</span>
            </div>
            <button 
              className="card-button"
              onClick={() => navigate('/templates')}
            >
              Nowy szablon
            </button>
          </div>

          <div className="dashboard-card">
            <h3>Statystyki</h3>
            <p>Analizuj wyniki kampanii</p>
            <div className="card-stats">
              <span className="stat-number">0%</span>
              <span className="stat-label">Średnia otwieralność</span>
            </div>
            <button className="card-button">Zobacz raporty</button>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Ostatnia aktywność</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📧</div>
              <div className="activity-content">
                <p><strong>Witamy!</strong></p>
                <p>To jest Twój pierwszy raz w panelu mailingowym. Zacznij od utworzenia pierwszej kampanii.</p>
                <span className="activity-time">Teraz</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;