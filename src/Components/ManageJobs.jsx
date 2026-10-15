import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageJobs.css';

const INITIAL_RECRUITER_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer',
    location: 'Bengaluru (Hybrid)',
    type: 'Full-time',
    salary: '₹18L – ₹24L',
    applicantCount: 42,
    status: 'Open',
    createdAt: '2026-10-01'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    location: 'Hyderabad (On-site)',
    type: 'Full-time',
    salary: '₹22L – ₹30L',
    applicantCount: 28,
    status: 'Open',
    createdAt: '2026-09-28'
  }
];

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(INITIAL_RECRUITER_JOBS);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requiredSkills: ''
  });

  const handleToggleStatus = (jobId) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: j.status === 'Open' ? 'Closed' : 'Open' } : j
      )
    );
  };

  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.location) return;

    const created = {
      ...newJob,
      id: Date.now().toString(),
      applicantCount: 0,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setJobs([created, ...jobs]);
    setShowModal(false);
    setNewJob({
      title: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requiredSkills: ''
    });
  };

  return (
    <div className="dark-manage-jobs-container">
      <div className="page-header-flex">
        <div>
          <h1>Manage Job Listings</h1>
          <p>Post new positions, edit active listings, and track candidate response counts.</p>
        </div>
        <button className="btn-primary-blue" onClick={() => setShowModal(true)}>
          ＋ Create Job Post
        </button>
      </div>

      <div className="job-listings-table-card">
        <table className="recruiter-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location & Type</th>
              <th>Salary Range</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <span className="font-bold">{job.title}</span>
                  <p className="sub-text">Posted on {job.createdAt}</p>
                </td>
                <td>{job.location} · {job.type}</td>
                <td>{job.salary}</td>
                <td>
                  <span className="applicant-badge">{job.applicantCount} candidates</span>
                </td>
                <td>
                  <span className={`status-tag ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="btn-action-sm"
                    onClick={() => navigate('/admin/applications')}
                  >
                    View Applicants
                  </button>
                  <button
                    className="btn-action-sm secondary"
                    onClick={() => handleToggleStatus(job.id)}
                  >
                    {job.status === 'Open' ? 'Close Listing' : 'Reopen'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Post Job Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <h3>Post New Job Listing</h3>
            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location & Work Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru (Remote)"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹20L - ₹28L"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, JavaScript, Node.js, REST APIs"
                  value={newJob.requiredSkills}
                  onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Detailed Job Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe key responsibilities, team structure, and prerequisites..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </div>

              <div className="modal-actions-btns">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Publish Job
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