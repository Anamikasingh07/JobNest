import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Joblist from './Components/Joblist';
import TrackerPage from './Components/TrackerPage';
import AIPage from './Components/AIPage';
import ProfilePage from './Components/ProfilePage'; // 👈 Check this import
import AdminDashboard from './Components/AdminDashboard';
import ManageJobs from './Components/ManageJobs';
import AdminApplications from './Components/AdminApplications';
import AuthPage from './Components/AuthPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/jobs" element={<Joblist />} />
          <Route path="/ai-assistant" element={<AIPage />} />
          
          {/* Make sure it points to ProfilePage */}
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage" element={<ManageJobs />} />
          <Route path="/admin/applications" element={<AdminApplications />} />

          <Route path="*" element={<Navigate to="/tracker" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;