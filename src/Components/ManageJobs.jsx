import React, { useState, useEffect } from 'react';
import API from '../services/applicationService';
import './ManageJobs.css';

const ManageJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    workMode: 'Remote',
    type: 'Full-time',
    salary: '',
    description: ''
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

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

  return (
    <div className="manage-jobs-page">
      <div className="manage-jobs-header">
        <div>
          <h2>Company Job Postings</h2>
          <p className="subtitle">Manage active openings for your organization ({myJobs.length})</p>
        </div>
        <button className="btn-create-job" onClick={() => setShowModal(true)}>
          + Create Job Listing
        </button>
      </div>

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
                  <span className="card-type-tag">{job.type}</span>
                </div>
                <h3 className="job-card-title">{job.title}</h3>
                <p className="job-card-company">{job.company}</p>
                <p className="job-card-meta">{job.location} • {job.workMode}</p>
                <p className="job-card-salary">{job.salary}</p>
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