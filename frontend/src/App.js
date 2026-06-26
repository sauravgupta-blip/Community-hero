import React, { useState } from 'react';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState('citizen');

  return (
    <div className="app">
      <div className="toggle-container">
        <h1>🏘️ Community Hero</h1>
        
        <div className="role-toggle">
          <button
            className={`toggle-btn ${userRole === 'citizen' ? 'active' : ''}`}
            onClick={() => setUserRole('citizen')}
          >
            👤 Citizen Mode
          </button>
          
          <div style={{ fontSize: '18px', color: '#667eea' }}>
            {userRole === 'citizen' ? '→' : '←'}
          </div>
          
          <button
            className={`toggle-btn ${userRole === 'authority' ? 'active' : ''}`}
            onClick={() => setUserRole('authority')}
          >
            🏛️ Authority Mode
          </button>
        </div>
      </div>

      <div className="dashboard">
        {userRole === 'citizen' ? (
          <CitizenDashboard />
        ) : (
          <AuthorityDashboard />
        )}
      </div>
    </div>
  );
}

export default App;