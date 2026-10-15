import React, { useState, useEffect } from 'react';
import Column from './Column';
import './TrackerPage.css';

const STAGES = [
  { id: 'Wishlist', title: 'Wishlist', emptyText: 'Saved jobs appear here' },
  { id: 'Applied', title: 'Applied', emptyText: 'No applications yet' },
  { id: 'Interview', title: 'Interview', emptyText: 'Drop a job here' },
  { id: 'Offer', title: 'Offer', emptyText: 'Offers appear here' },
  { id: 'Rejected', title: 'Rejected', emptyText: 'Nothing here yet' }
];

const INITIAL_APPLICATIONS = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    companyName: 'Google',
    location: 'Bengaluru',
    salary: '18–24 LPA',
    status: 'Applied',
    source: 'Internal',
    appliedDaysAgo: 10,
    badgeText: 'Follow up in 3d',
    logoLetter: 'G',
    logoBg: '#1a73e8',
    notes: 'Referred by alumni on LinkedIn. Follow up with HR if no reply by Thursday.',
    interviewDate: '2026-10-18',
    followUpReminder: '2026-10-15'
  }
];

const TrackerPage = () => {
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('tracker_applications');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [activeModalApp, setActiveModalApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    salary: '',
    status: 'Wishlist',
    source: 'External'
  });

  useEffect(() => {
    localStorage.setItem('tracker_applications', JSON.stringify(applications));
  }, [applications]);

  const activeCount = applications.filter((app) => app.status !== 'Wishlist').length;

  const handleStageChange = (appId, newStage) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStage } : app))
    );
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    setApplications((prev) =>
      prev.map((app) => (app.id === activeModalApp.id ? { ...activeModalApp } : app))
    );
    setActiveModalApp(null);
  };

  const handleAddJobSubmit = (e) => {
    e.preventDefault();
    if (!newJob.jobTitle || !newJob.companyName) return;

    const created = {
      ...newJob,
      id: Date.now().toString(),
      appliedDaysAgo: 0,
      badgeText: newJob.source,
      logoLetter: newJob.companyName.charAt(0).toUpperCase(),
      logoBg: '#1D4F9F'
    };

    setApplications([created, ...applications]);
    setShowAddModal(false);
    setNewJob({
      jobTitle: '',
      companyName: '',
      location: '',
      salary: '',
      status: 'Wishlist',
      source: 'External'
    });
  };

  return (
    <div className="tracker-page-container">
      {/* Header Bar */}
      <div className="tracker-header-row">
        <div>
          <h1 className="tracker-heading">Application tracker</h1>
          <p className="tracker-subtext">
            {activeCount} active application · Move jobs between stages as you progress.
          </p>
        </div>
        <button className="btn-add-external" onClick={() => setShowAddModal(true)}>
          Add external job
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div className="tracker-kanban-grid">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage.id);
          return (
            <div key={stage.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title-flex">
                  <span className={`status-dot ${stage.id.toLowerCase()}`}></span>
                  <span className="column-title">{stage.title}</span>
                </div>
                <span className="column-count-badge">{stageApps.length}</span>
              </div>

              <div className="column-cards-container">
                {stageApps.length === 0 ? (
                  <div className="empty-column-box">{stage.emptyText}</div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="tracker-card-tile"
                      onClick={() => setActiveModalApp({ ...app })}
                    >
                      <div className="card-top-flex">
                        <div
                          className="card-logo-avatar"
                          style={{ backgroundColor: app.logoBg || '#1D4F9F' }}
                        >
                          {app.logoLetter || app.companyName.charAt(0)}
                        </div>
                        <div className="card-title-group">
                          <h3 className="card-job-title">{app.jobTitle}</h3>
                          <p className="card-company-name">{app.companyName}</p>
                        </div>
                      </div>

                      <div className="card-details-group">
                        <p className="card-meta-line">📍 {app.location}</p>
                        <p className="card-meta-line">💼 {app.salary}</p>
                      </div>

                      <div className="card-tags-row">
                        <span className="pill-tag source">{app.source}</span>
                        {app.badgeText && (
                          <span className="pill-tag warning">{app.badgeText}</span>
                        )}
                      </div>

                      <div className="card-footer-flex">
                        <span className="applied-time-text">
                          Applied {app.appliedDaysAgo} days ago
                        </span>

                        <select
                          className="stage-select-dropdown"
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeModalApp && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>
              {activeModalApp.jobTitle} · {activeModalApp.companyName}
            </h3>
            <form onSubmit={handleSaveModal}>
              <div className="form-group">
                <label>Status Stage</label>
                <select
                  value={activeModalApp.status}
                  onChange={(e) =>
                    setActiveModalApp({ ...activeModalApp, status: e.target.value })
                  }
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Follow-up Reminder Date</label>
                <input
                  type="date"
                  value={activeModalApp.followUpReminder || ''}
                  onChange={(e) =>
                    setActiveModalApp({
                      ...activeModalApp,
                      followUpReminder: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="4"
                  value={activeModalApp.notes || ''}
                  onChange={(e) =>
                    setActiveModalApp({ ...activeModalApp, notes: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActiveModalApp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add External Job Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add External Job</h3>
            <form onSubmit={handleAddJobSubmit}>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={newJob.jobTitle}
                  onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={newJob.companyName}
                  onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. 18–24 LPA"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;