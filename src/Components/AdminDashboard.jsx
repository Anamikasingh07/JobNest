import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats] = useState({
    activeListings: 12,
    totalApplications: 148,
    interviewsScheduled: 24,
    offersExtended: 5
  });

  const [recentApplicants] = useState([
    { id: 'a1', name: 'Anamika Singh', role: 'Frontend Developer', status: 'Interview', date: '2026-10-10' },
    { id: 'a2', name: 'Rahul Sharma', role: 'Full Stack Engineer', status: 'Applied', date: '2026-10-11' },
    { id: 'a3', name: 'Priya Verma', role: 'UI/UX Designer', status: 'Offer', date: '2026-10-09' }
  ]);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header-row">
        <div>
          <h1>Recruiter Control Center</h1>
          <p>Monitor posted jobs, review incoming candidates, and manage pipeline analytics.</p>
        </div>
        <button className="btn-primary-blue" onClick={() => navigate('/admin/manage')}>
          + Post New Job
        </button>
      </div>

      {/* Metric Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Active Job Posts</span>
          <span className="stat-num">{stats.activeListings}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Total Applications</span>
          <span className="stat-num">{stats.totalApplications}</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-label">Interviews Scheduled</span>
          <span className="stat-num">{stats.interviewsScheduled}</span>
        </div>
        <div className="admin-stat-card highlight">
          <span className="stat-label">Offers Extended</span>
          <span className="stat-num">{stats.offersExtended}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-table-box">
        <div className="table-header-flex">
          <h3>Recent Candidate Submissions</h3>
          <button className="btn-secondary-link" onClick={() => navigate('/admin/applications')}>
            View All Applicants →
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant Name</th>
              <th>Applied Role</th>
              <th>Date</th>
              <th>Current Stage</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentApplicants.map((app) => (
              <tr key={app.id}>
                <td className="font-bold">{app.name}</td>
                <td>{app.role}</td>
                <td>{app.date}</td>
                <td>
                  <span className={`status-pill ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-sm-action"
                    onClick={() => navigate('/admin/applications')}
                  >
                    Review Candidate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;