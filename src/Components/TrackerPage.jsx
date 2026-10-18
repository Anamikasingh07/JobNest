import React, { useCallback, useEffect, useState } from 'react';
import API from '../services/applicationService';
import './TrackerPage.css';

const STAGES = [
  { id: 'Applied', title: 'Applied', emptyText: 'No applications yet' },
  { id: 'Interview', title: 'Interview', emptyText: 'No interview invitations yet' },
  { id: 'On Hold', title: 'On Hold', emptyText: 'No applications on hold' },
  { id: 'Offer', title: 'Offer', emptyText: 'No offers yet' },
  { id: 'Rejected', title: 'Rejected', emptyText: 'No rejected applications' }
];

const toTrackerApplication = (application) => {
  const job = application.job || {};
  const appliedAt = new Date(application.appliedAt || Date.now()).getTime();
  const appliedDaysAgo = Number.isFinite(appliedAt)
    ? Math.max(0, Math.floor((Date.now() - appliedAt) / 86400000))
    : 0;

  return {
    id: application._id,
    jobTitle: job.title || 'Job posting unavailable',
    companyName: job.companyName || job.company || 'Company unavailable',
    location: job.location || 'Location unavailable',
    salary: job.salary || 'Salary not listed',
    status: STAGES.some((stage) => stage.id === application.status) ? application.status : 'Applied',
    appliedDaysAgo,
    description: job.description || '',
    skills: Array.isArray(job.skills) ? job.skills : [],
    questions: Array.isArray(job.questions) ? job.questions : [],
    answers: Array.isArray(application.answers) ? application.answers : [],
    employmentType: job.employmentType || job.type || '',
    workMode: job.workMode || '',
    job
  };
};

const TrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      const response = await API.get('/applications/candidate');
      const list = Array.isArray(response.data) ? response.data : [];
      setApplications(list.map(toTrackerApplication));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load your applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
    const refreshTimer = window.setInterval(loadApplications, 10000);
    window.addEventListener('focus', loadApplications);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', loadApplications);
    };
  }, [loadApplications]);

  const activeCount = applications.filter((app) => !['Rejected', 'Offer'].includes(app.status)).length;

  return (
    <div className="tracker-page-container">
      <div className="tracker-header-row">
        <div>
          <h1 className="tracker-heading">Application tracker</h1>
          <p className="tracker-subtext">{activeCount} active application{activeCount === 1 ? '' : 's'} · Status updates come from recruiters.</p>
        </div>
        <button className="btn-add-external" type="button" onClick={loadApplications}>Refresh</button>
      </div>

      {error && <p className="tracker-subtext" role="alert">{error}</p>}

      <div className="tracker-kanban-grid">
        {STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage.id);
          return (
            <div key={stage.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title-flex">
                  <span className={`status-dot ${stage.id.toLowerCase().replace(' ', '-')}`}></span>
                  <span className="column-title">{stage.title}</span>
                </div>
                <span className="column-count-badge">{stageApps.length}</span>
              </div>
              <div className="column-cards-container">
                {loading ? <div className="empty-column-box">Loading...</div> : stageApps.length === 0 ? (
                  <div className="empty-column-box">{stage.emptyText}</div>
                ) : stageApps.map((app) => (
                  <article
                    key={app.id}
                    className="tracker-card-tile"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedApplication(app)}
                    onKeyDown={(event) => event.key === 'Enter' && setSelectedApplication(app)}
                    aria-label={`View details for ${app.jobTitle} at ${app.companyName}`}
                  >
                    <div className="card-top-flex">
                      <div className="card-logo-avatar">{app.companyName.charAt(0).toUpperCase()}</div>
                      <div className="card-title-group">
                        <h3 className="card-job-title">{app.jobTitle}</h3>
                        <p className="card-company-name">{app.companyName}</p>
                      </div>
                    </div>
                    <div className="card-details-group">
                      <p className="card-meta-line">{app.location}</p>
                      <p className="card-meta-line">{app.salary}</p>
                    </div>
                    <div className="card-footer-flex">
                      <span className="applied-time-text">Applied {app.appliedDaysAgo} day{app.appliedDaysAgo === 1 ? '' : 's'} ago</span>
                      <span className="stage-select-dropdown">{app.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedApplication && (
        <div className="tracker-details-backdrop" onClick={() => setSelectedApplication(null)}>
          <article className="tracker-details-card" role="dialog" aria-modal="true" aria-labelledby="tracker-job-title" onClick={(event) => event.stopPropagation()}>
            <header className="tracker-details-header">
              <div>
                <p className="tracker-details-company">{selectedApplication.companyName}</p>
                <h2 id="tracker-job-title">{selectedApplication.jobTitle}</h2>
              </div>
              <button type="button" className="tracker-details-close" onClick={() => setSelectedApplication(null)} aria-label="Close job details">×</button>
            </header>
            <p><strong>Status:</strong> {selectedApplication.status}</p>
            <p><strong>Location:</strong> {selectedApplication.location}</p>
            <p><strong>Type:</strong> {selectedApplication.employmentType || 'Not listed'} · {selectedApplication.workMode || 'Work mode not listed'}</p>
            <section className="tracker-job-detail-section">
              <h3>Job description</h3>
              <p>{selectedApplication.description || 'No description was included in this posting.'}</p>
            </section>
            <section className="tracker-job-detail-section">
              <h3>Skills requested by the recruiter</h3>
              {selectedApplication.skills.length ? <div className="tracker-requested-skills">{selectedApplication.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>No specific skills were listed.</p>}
            </section>
            <section className="tracker-job-detail-section">
              <h3>Screening questions</h3>
              {selectedApplication.questions.length ? selectedApplication.questions.map((question, index) => {
                const answer = selectedApplication.answers.find((item) => item.questionText === question.questionText);
                return <div className="tracker-screening-question" key={`${question.questionText}-${index}`}><strong>{question.questionText}</strong><p>Your answer: {answer?.answerText || 'No answer submitted'}</p></div>;
              }) : <p>This posting had no screening questions.</p>}
            </section>
          </article>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
