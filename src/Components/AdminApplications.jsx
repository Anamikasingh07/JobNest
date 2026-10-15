import React, { useState } from 'react';
import './AdminApplications.css';

const INITIAL_APPLICANTS = [
  {
    id: 'app1',
    name: 'Anamika Singh',
    email: 'anamika@example.com',
    appliedRole: 'Frontend Developer',
    matchScore: 92,
    stage: 'Interview',
    appliedDate: '2026-10-10',
    resumeName: 'Anamika_Singh_Resume.pdf',
    coverNote: 'Experienced building responsive React portals and component libraries.'
  },
  {
    id: 'app2',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    appliedRole: 'Full Stack Engineer',
    matchScore: 78,
    stage: 'Applied',
    appliedDate: '2026-10-11',
    resumeName: 'Rahul_Sharma_CV.pdf',
    coverNote: 'Strong background in Node.js, Express, and MongoDB microservices.'
  }
];

const AdminApplications = () => {
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [selectedApplicant, setSelectedApplicant] = useState(INITIAL_APPLICANTS[0]);

  const handleUpdateStage = (applicantId, newStage) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === applicantId ? { ...app, stage: newStage } : app))
    );
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant((prev) => ({ ...prev, stage: newStage }));
    }
  };

  return (
    <div className="dark-admin-apps-container">
      <div className="page-header-flex">
        <div>
          <h1>Applicant Management</h1>
          <p>Review candidate profiles, evaluate match scores, and update hiring stages.</p>
        </div>
      </div>

      <div className="apps-split-container">
        {/* Left Candidate Feed */}
        <div className="apps-feed-pane">
          {applicants.map((app) => (
            <div
              key={app.id}
              className={`applicant-card ${selectedApplicant?.id === app.id ? 'active' : ''}`}
              onClick={() => setSelectedApplicant(app)}
            >
              <div className="card-top-row">
                <h3 className="applicant-name">{app.name}</h3>
                <span className="match-tag">{app.matchScore}% Match</span>
              </div>
              <p className="applied-role-text">{app.appliedRole}</p>
              <div className="card-bottom-row">
                <span className="applied-date-text">{app.appliedDate}</span>
                <span className={`stage-pill ${app.stage.toLowerCase()}`}>{app.stage}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail Pane */}
        <div className="apps-detail-pane">
          {selectedApplicant ? (
            <div className="detail-card-inner">
              <div className="detail-header-flex">
                <div>
                  <h2>{selectedApplicant.name}</h2>
                  <p className="sub-text">
                    Applied for <strong>{selectedApplicant.appliedRole}</strong> · {selectedApplicant.email}
                  </p>
                </div>

                <div className="stage-selector-box">
                  <label>Current Hiring Stage:</label>
                  <select
                    value={selectedApplicant.stage}
                    onChange={(e) => handleUpdateStage(selectedApplicant.id, e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <hr className="detail-divider" />

              <div className="detail-section">
                <h3>Resume File</h3>
                <div className="file-box">
                  <span>📄 {selectedApplicant.resumeName}</span>
                  <button className="btn-sm-action">Preview Resume</button>
                </div>
              </div>

              <div className="detail-section">
                <h3>Cover Note</h3>
                <p className="cover-note-body">{selectedApplicant.coverNote}</p>
              </div>
            </div>
          ) : (
            <div className="empty-selection">Select an applicant to review details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;