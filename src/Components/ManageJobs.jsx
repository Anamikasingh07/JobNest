import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import { getProfileCompletion } from '../utils/profileCompletion';
import './ManageJobs.css';

const ManageJobs = () => {
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    skills: '',
    experienceLevel: 'Any',
    location: '',
    workMode: 'Remote',
    type: 'Full-time',
    salary: '',
    description: ''
  });

  useEffect(() => {
    fetchMyJobs();
    API.get('/auth/profile').then(({ data }) => {
      setRecruiterProfile(data);
      if (data.companyName) setFormData((current) => ({ ...current, companyName: data.companyName }));
    }).catch(() => {}).finally(() => setProfileLoading(false));
  }, []);

  const profileCompletion = getProfileCompletion(recruiterProfile, 'recruiter');

  const fetchMyJobs = async () => {
    try {
      const res = await API.get('/jobs/my-jobs');
      setMyJobs(res.data);
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/jobs', formData);
      setShowModal(false);
      setFormData({
        title: '',
        companyName: '',
        skills: '',
        experienceLevel: 'Any',
        location: '',
        workMode: 'Remote',
        type: 'Full-time',
        salary: '',
        description: ''
      });
      fetchMyJobs();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (job) => {
    const status = job.status === 'Closed' ? 'Open' : 'Closed';
    try {
      const response = await API.put(`/jobs/${job._id}/status`, { status });
      setMyJobs((currentJobs) => currentJobs.map((currentJob) =>
        currentJob._id === job._id ? response.data.job : currentJob
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job posting.');
    }
  };

  return (
    <div className="manage-jobs-page">
      <div className="manage-jobs-header">
        <div>
          <h2>Company Job Postings</h2>
          <p className="subtitle">Manage active openings for your organization ({myJobs.length})</p>
        </div>
        <button className="btn-create-job" disabled={profileLoading || !profileCompletion.complete} onClick={() => setShowModal(true)}>
          + Create Job Listing
        </button>
      </div>

      {!profileLoading && !profileCompletion.complete && (
        <div className="profile-completion-notice" role="status">
          <div><strong>Complete your recruiter profile before posting a job.</strong><p>Still needed: {profileCompletion.missing.join(', ')}.</p></div>
          <button type="button" onClick={() => navigate('/profile')}>Complete profile</button>
        </div>
      )}

      <div className="jobs-list-container">
        {myJobs.length === 0 ? (
          <div className="no-jobs-card">
            <p>You haven't published any job listings yet.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {myJobs.map((job) => (
              <div key={job._id} className="recruiter-job-card">
                <div className="card-top-row">
                  <span className={`status-pill ${job.status ? job.status.toLowerCase() : 'open'}`}>{job.status || 'Open'}</span>
                  <span className="card-type-tag">{job.employmentType || job.type || 'Full-time'}</span>
                </div>
                <h3 className="job-card-title">{job.title}</h3>
                <p className="job-card-company">{job.companyName || job.company}</p>
                <p className="job-card-meta">{job.location} • {job.workMode}</p>
                <p className="job-card-salary">{job.salary}</p>
                <button type="button" className={`btn-job-status ${job.status === 'Closed' ? 'republish' : ''}`} onClick={() => handleToggleJobStatus(job)}>
                  {job.status === 'Closed' ? 'Republish job' : 'Close posting'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post New Job</h3>
              <button className="btn-close-x" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Company Name</label>
                  <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Company name" required />
                </div>
                <div className="form-group flex-1">
                  <label>Required Skills</label>
                  <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="React, JavaScript, Node.js" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, New Delhi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    required
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Employment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹12 - ₹15 LPA"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <select value={formData.experienceLevel} onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })} required>
                  <option value="Any">Any experience level</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  rows="4"
                  placeholder="Enter detailed role responsibilities and qualifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Job Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
