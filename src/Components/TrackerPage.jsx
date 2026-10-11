import React, { useState, useEffect } from 'react';
import Column from './Column';
import './TrackerPage.css';

const STAGES = [
  { id: 'Wishlist', title: 'Wishlist' },
  { id: 'Applied', title: 'Applied' },
  { id: 'Interview', title: 'Interview' },
  { id: 'Offer', title: 'Offer' },
  { id: 'Rejected', title: 'Rejected' }
];

const TrackerPage = () => {
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('tracker_applications');
    return saved
      ? JSON.parse(saved)
      : [
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
            badgeType: 'warning',
            logoLetter: 'G',
            logoBg: '#1a73e8',
            notes: 'Referred by alumni on LinkedIn. Follow up with HR if no reply by Thursday.',
            interviewDate: '2026-10-18',
            followUpReminder: '2026-10-15'
          }
        ];
  });

  const [activeModalApp, setActiveModalApp] = useState(null);

  useEffect(() => {
    localStorage.setItem('tracker_applications', JSON.stringify(applications));
  }, [applications]);

  const handleCardClick = (app) => {
    setActiveModalApp({ ...app });
  };

  const handleSaveAppDetails = (e) => {
    e.preventDefault();
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === activeModalApp.id) {
          const updatedBadge = activeModalApp.followUpReminder
            ? `Follow up on ${activeModalApp.followUpReminder}`
            : app.badgeText;
          return { ...activeModalApp, badgeText: updatedBadge };
        }
        return app;
      })
    );
    setActiveModalApp(null);
  };

  return (
    <div className="dark-tracker-container">
      <div className="tracker-top-bar">
        <h1>Application Tracker</h1>
      </div>

      <div className="tracker-kanban-board">
        {STAGES.map((stage) => (
          <Column
            key={stage.id}
            stage={stage}
            applications={applications.filter((app) => app.status === stage.id)}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* Full Detail & Follow-up Edit Modal */}
      {activeModalApp && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <h3>{activeModalApp.jobTitle} · {activeModalApp.companyName}</h3>
            <form onSubmit={handleSaveAppDetails}>
              <div className="form-row">
                <div className="form-group">
                  <label>Status Stage</label>
                  <select
                    value={activeModalApp.status}
                    onChange={(e) => setActiveModalApp({ ...activeModalApp, status: e.target.value })}
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled Interview Date</label>
                  <input
                    type="date"
                    value={activeModalApp.interviewDate || ''}
                    onChange={(e) => setActiveModalApp({ ...activeModalApp, interviewDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Follow-up Reminder Date</label>
                <input
                  type="date"
                  value={activeModalApp.followUpReminder || ''}
                  onChange={(e) => setActiveModalApp({ ...activeModalApp, followUpReminder: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Recruiter Notes & Key Takeaways</label>
                <textarea
                  rows="4"
                  value={activeModalApp.notes || ''}
                  onChange={(e) => setActiveModalApp({ ...activeModalApp, notes: e.target.value })}
                  placeholder="Add interview questions, salary discussion notes, or recruiter contact info..."
                />
              </div>

              <div className="modal-actions-btns">
                <button type="button" className="btn-cancel" onClick={() => setActiveModalApp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
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