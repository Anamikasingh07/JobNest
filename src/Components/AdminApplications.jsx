import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/applicationService';
import './AdminApplications.css';

const AdminApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [error, setError] = useState('');
  const applicationId = searchParams.get('applicationId');

  useEffect(() => {
    let active = true;
    const loadApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await API.get('/applications/recruiter');
        if (!active) return;
        const list = Array.isArray(response.data) ? response.data : response.data.applications || [];
        setApplications(list);

        if (applicationId) {
          const detailResponse = await API.get(`/applications/recruiter/${applicationId}`);
          if (active) setSelectedApp(detailResponse.data);
        } else if (active) {
          setSelectedApp(null);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Could not load recruiter applications.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplications();
    return () => { active = false; };
  }, [applicationId]);

  const openApplication = (id) => {
    setError('');
    setShowCandidateProfile(false);
    setSearchParams({ applicationId: id });
  };

  const closeDetails = () => {
    setSelectedApp(null);
    setSearchParams({});
  };

  const updateApplicationStatus = async (status) => {
    if (!selectedApp || updatingStatus) return;
    setUpdatingStatus(true);
    setError('');
    try {
      const response = await API.patch(`/applications/recruiter/${selectedApp._id}/status`, { status });
      const updatedApplication = response.data.application;
      setSelectedApp((current) => ({ ...current, status: updatedApplication.status }));
      setApplications((current) => current.map((application) =>
        application._id === updatedApplication._id
          ? { ...application, status: updatedApplication.status }
          : application
      ));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const applicantName = selectedApp?.applicantDetails?.fullName || selectedApp?.candidate?.name || 'Candidate';
  const applicantEmail = selectedApp?.applicantDetails?.email || selectedApp?.candidate?.email || 'Email unavailable';
  const jobGroups = applications.reduce((groups, application) => {
    const jobId = String(application.job?._id || application.job || 'unknown');
    if (!groups.has(jobId)) groups.set(jobId, { id: jobId, title: application.job?.title || 'Job posting', applications: [] });
    groups.get(jobId).applications.push(application);
    return groups;
  }, new Map());
  const visibleJobGroups = [...jobGroups.values()].filter((group) => selectedJobId === 'all' || group.id === selectedJobId);
  const visibleApplicationCount = visibleJobGroups.reduce((count, group) => count + group.applications.length, 0);
  const resumeHref = selectedApp?.resumeData
    ? `data:${selectedApp.resumeContentType || 'application/octet-stream'};base64,${selectedApp.resumeData}`
    : '';

  return (
    <section className="applications-page">
      <header className="applications-page-header">
        <div>
          <p className="applications-eyebrow">RECRUITER WORKSPACE</p>
          <h1>Applicants</h1>
          <p>Review candidates who applied to your job postings.</p>
        </div>
        <span className="applications-count">{applications.length} application{applications.length === 1 ? '' : 's'}</span>
      </header>

      {error && <div className="applications-error" role="alert">{error}</div>}

      <div className="applications-toolbar">
        <label htmlFor="application-job-filter">Filter by job posting
          <select id="application-job-filter" value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
            <option value="all">All job postings</option>
            {[...jobGroups.values()].map((group) => <option key={group.id} value={group.id}>{group.title} ({group.applications.length})</option>)}
          </select>
        </label>
        <span>{visibleApplicationCount} application{visibleApplicationCount === 1 ? '' : 's'} across {visibleJobGroups.length} posting{visibleJobGroups.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? <div className="applications-table-card"><p className="applications-empty">Loading applications...</p></div> : visibleJobGroups.length ? (
        <div className="application-job-groups">
          {visibleJobGroups.map((group) => (
            <section className="application-job-group" key={group.id}>
              <header className="application-job-group-header">
                <div><p className="applications-eyebrow">JOB POSTING</p><h2>{group.title}</h2></div>
                <span>{group.applications.length} applicant{group.applications.length === 1 ? '' : 's'}</span>
              </header>
              <div className="applications-table-card">
                <table className="applications-table">
                  <thead><tr><th>Candidate</th><th>Status</th><th>Applied on</th><th /></tr></thead>
                  <tbody>{group.applications.map((application) => (
                    <tr key={application._id}>
                      <td><strong>{application.applicantDetails?.fullName || application.candidate?.name || 'Candidate'}</strong><small>{application.applicantDetails?.email || application.candidate?.email}</small></td>
                      <td><span className="application-status-label">{application.status || 'Applied'}</span></td>
                      <td>{application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '—'}</td>
                      <td><button type="button" className="application-review-button" onClick={() => openApplication(application._id)}>Review candidate</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ) : <div className="applications-table-card"><p className="applications-empty">{applications.length ? 'No applications for this posting.' : 'No applications received for your job postings yet.'}</p></div>}

      {selectedApp && (
        <div className="application-detail-backdrop" onClick={closeDetails}>
          <article className="application-detail-card" role="dialog" aria-modal="true" aria-labelledby="application-detail-title" onClick={(event) => event.stopPropagation()}>
            <header className="application-detail-header">
              <div>
                <p className="applications-eyebrow">{selectedApp.job?.title || 'Job application'}</p>
                <h2 id="application-detail-title">{applicantName}</h2>
              </div>
              <button type="button" className="application-close-button" onClick={closeDetails} aria-label="Close application details">×</button>
            </header>

            <section className="application-detail-section">
              <h3>Candidate details</h3>
              <p><strong>Application status:</strong> {selectedApp.status || 'Applied'}</p>
              <p><strong>Email:</strong> {applicantEmail}</p>
              <p><strong>Phone:</strong> {selectedApp.applicantDetails?.phone || selectedApp.candidate?.phone || 'Not provided'}</p>
              <p><strong>Location:</strong> {selectedApp.applicantDetails?.location || 'Not provided'}</p>
              <p><strong>Applied:</strong> {selectedApp.appliedAt ? new Date(selectedApp.appliedAt).toLocaleString() : '—'}</p>
            </section>

            <section className="application-detail-section">
              <button type="button" className="application-review-button" onClick={() => setShowCandidateProfile((visible) => !visible)}>
                {showCandidateProfile ? 'Hide profile' : 'View profile'}
              </button>
            </section>

            {showCandidateProfile && (
              <section className="application-detail-section candidate-profile-section">
                <h3>Candidate profile</h3>
                <p><strong>Headline:</strong> {selectedApp.candidate?.headline || 'Not provided'}</p>
                <p><strong>Location:</strong> {selectedApp.candidate?.location || selectedApp.applicantDetails?.location || 'Not provided'}</p>
                <p><strong>About:</strong> {selectedApp.candidate?.about || 'Not provided'}</p>
                <div><strong>Skills</strong><div className="candidate-profile-tags">{selectedApp.candidate?.skills?.length ? selectedApp.candidate.skills.map((skill) => <span key={skill}>{skill}</span>) : <p>No skills listed.</p>}</div></div>
                <p><strong>Experience</strong></p>
                {selectedApp.candidate?.experience?.length ? <ul>{selectedApp.candidate.experience.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>Not provided</p>}
                <p><strong>Education</strong></p>
                {selectedApp.candidate?.education?.length ? <ul>{selectedApp.candidate.education.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>Not provided</p>}
                <p><strong>Links</strong></p>
                {selectedApp.candidate?.links?.length ? <ul>{selectedApp.candidate.links.map((link, index) => <li key={`${link}-${index}`}><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer">{link}</a></li>)}</ul> : <p>Not provided</p>}
              </section>
            )}

            <section className="application-detail-section">
              <h3>Update application</h3>
              <p>Choose the next step for this candidate.</p>
              <div className="application-status-actions">
                <button type="button" className="application-status-button interview" disabled={updatingStatus} onClick={() => updateApplicationStatus('Interview')}>
                  {updatingStatus ? 'Saving...' : 'Invite for interview'}
                </button>
                <button type="button" className="application-status-button hold" disabled={updatingStatus} onClick={() => updateApplicationStatus('On Hold')}>
                  Put on hold
                </button>
                <button type="button" className="application-status-button reject" disabled={updatingStatus} onClick={() => updateApplicationStatus('Rejected')}>
                  Reject
                </button>
              </div>
            </section>

            <section className="application-detail-section">
              <h3>Resume</h3>
              {resumeHref ? (
                <a className="application-resume-link" href={resumeHref} download={selectedApp.resumeName || 'candidate-resume'}>
                  Download {selectedApp.resumeName || 'candidate resume'}
                </a>
              ) : (
                <p>{selectedApp.resumeName || selectedApp.candidate?.resume || 'No resume was attached to this application.'}</p>
              )}
            </section>

            {selectedApp.coverLetter && (
              <section className="application-detail-section">
                <h3>Cover letter</h3>
                <p className="application-cover-letter">{selectedApp.coverLetter}</p>
              </section>
            )}

            <section className="application-detail-section">
              <h3>Screening question answers</h3>
              {selectedApp.answers?.length ? selectedApp.answers.map((answer, index) => (
                <div className="application-answer" key={`${answer.questionText}-${index}`}>
                  <strong>{answer.questionText}</strong>
                  <p>{answer.answerText || 'No answer provided'}</p>
                </div>
              )) : <p>No screening questions were included with this application.</p>}
            </section>
          </article>
        </div>
      )}
    </section>
  );
};

export default AdminApplications;
