import React, { useState, useEffect } from 'react';
import API from '../services/applicationService';
import './AdminApplications.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await API.get('/applications/recruiter/applicants');
      setApplications(res.data);
    } catch (err) {
      console.error('Error loading applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await API.put(`/applications/${appId}/status`, { status: newStatus });
      fetchApplicants();
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update stage status.');
    }
  };

  if (loading) return <div className="admin-app-loading">Loading candidate submissions...</div>;

  return (
    <div className="admin-app-page">
      <div className="admin-app-header">
        <h2>Applicant Review Center</h2>
        <p className="subtitle">Review candidate profiles, submitted documents, and screening answers</p>
      </div>

      <div className="applications-table-wrapper">
        <table className="app-data-table">
          <thead>
            <tr>
              <th>APPLICANT NAME</th>
              <th>APPLIED ROLE</th>
              <th>DATE</th>
              <th>STAGE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">No candidate submissions found yet.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td className="applicant-name-cell">
                    <strong>{app.applicantName || app.candidateId?.name}</strong>
                    <span className="applicant-email">{app.applicantEmail || app.candidateId?.email}</span>
                  </td>
                  <td>{app.jobId?.title || 'Role Unavailable'}</td>
                  <td>{new Date(app.createdAt).toISOString().split('T')[0]}</td>
                  <td>
                    <span className={`stage-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn-review-candidate"
                      onClick={() => setSelectedApp(app)}
                    >
                      Review Candidate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate Profile Review Modal */}
      {selectedApp && (
        <div className="modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="modal-review-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedApp.applicantName || selectedApp.candidateId?.name}</h3>
                <p className="applied-role-tag">Applied for: {selectedApp.jobId?.title}</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="modal-body">
              {/* Profile Contact Info */}
              <div className="review-section">
                <h4>Contact Details</h4>
                <p><strong>Email:</strong> {selectedApp.applicantEmail || selectedApp.candidateId?.email}</p>
                <p><strong>Phone:</strong> {selectedApp.applicantPhone || 'Not provided'}</p>
              </div>

              {/* Status Update Row */}
              <div className="review-section">
                <h4>Pipeline Stage</h4>
                <select
                  className="status-select-input"
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Submitted Resume Document */}
              <div className="review-section">
                <h4>Submitted Resume / Document</h4>
                {selectedApp.resumeUrl ? (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-download-link"
                  >
                    📄 View Submitted Resume
                  </a>
                ) : (
                  <p className="no-data-text">Candidate attached standard profile resume.</p>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="review-section">
                  <h4>Cover Letter</h4>
                  <div className="text-box-display">{selectedApp.coverLetter}</div>
                </div>
              )}

              {/* Screening Answers */}
              {selectedApp.answers && selectedApp.answers.length > 0 && (
                <div className="review-section">
                  <h4>Screening Questions & Answers</h4>
                  <div className="answers-list">
                    {selectedApp.answers.map((ans, idx) => (
                      <div key={idx} className="answer-item">
                        <p className="q-text"><strong>Q:</strong> {ans.question}</p>
                        <p className="a-text"><strong>A:</strong> {ans.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;