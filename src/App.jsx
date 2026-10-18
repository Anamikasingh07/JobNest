import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Joblist from './Components/Joblist';
import TrackerPage from './Components/TrackerPage';
import AIPage from './Components/AIPage';
import ProfilePage from './Components/ProfilePage';
import ApplyPage from './Components/ApplyPage'; // 👈 Check this import
import AdminDashboard from './Components/AdminDashboard';
import ManageJobs from './Components/ManageJobs';
import AdminApplications from './Components/AdminApplications';
import AuthPage from './Components/AuthPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Focused Apply Route without Navbar header */}
        <Route path="/jobs/:id/apply" element={<ApplyPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Regular Routes wrapped with Top Navbar */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/tracker" replace />} />
                  <Route path="/tracker" element={<TrackerPage />} />
                  <Route path="/jobs" element={<Joblist />} />
                  <Route path="/ai-assistant" element={<AIPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/manage" element={<ManageJobs />} />
                  <Route path="/admin/applications" element={<AdminApplications />} />
                  <Route path="*" element={<Navigate to="/tracker" replace />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
