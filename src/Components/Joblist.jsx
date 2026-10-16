import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import './Joblist.css';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [experience, setExperience] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [jobType, setJobType] = useState('All');

  useEffect(() => {
    fetchJobs();
  }, [experience, workMode, jobType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTitle) params.title = searchTitle;
      if (searchLocation) params.location = searchLocation;
      if (experience !== 'All') params.experience = experience;
      if (workMode !== 'All') params.workMode = workMode;
      if (jobType !== 'All') params.type = jobType;

      const res = await API.get('/jobs', { params });
      setJobs(res.data);
      if (res.data && res.data.length > 0) {
        setSelectedJob(res.data[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="job-search-page">
      {/* Top Search Bar & Category Filters */}
      <div className="job-filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-inputs-row">
          <input
            type="text"
            className="filter-input"
            placeholder="Job title, keywords, or company"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <input
            type="text"
            className="filter-input"
            placeholder="City, state, or zip code"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <button type="submit" className="btn-find-jobs">Find Jobs</button>
        </form>

        <div className="dropdown-filters-row">
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className="filter-select">
            <option value="All">Experience Level: All</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs)</option>
            <option value="Senior Level">Senior Level</option>
          </select>

          <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="filter-select">
            <option value="All">Work Mode: All</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="filter-select">
            <option value="All">Job Type: All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="job-split-container">
        {/* Left Column: Job Feed */}
        <div className="job-feed-list">
          {loading ? (
            <div className="job-feed-status">Loading listings...</div>
          ) : jobs.length === 0 ? (
            <div className="job-feed-status">No jobs found matching your criteria.</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                className={`job-card-item ${selectedJob?._id === job._id ? 'active' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <h3 className="card-job-title">{job.title}</h3>
                <p className="card-company-name">{job.company}</p>
                <p className="card-location-meta">{job.location} ({job.workMode || 'On-site'})</p>
                <span className="card-salary-badge">{job.salary}</span>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Detailed View */}
        <div className="job-detail-pane">
          {selectedJob ? (
            <div className="detail-inner-content">
              <div className="detail-header">
                <h2 className="detail-title">{selectedJob.title}</h2>
                <p className="detail-subtitle">
                  {selectedJob.company} {selectedJob.location ? `• ${selectedJob.location}` : ''}
                </p>
                <div className="detail-tags">
                  <span className="detail-tag">{selectedJob.type || 'Full-time'}</span>
                  <span className="detail-tag">{selectedJob.workMode || 'On-site'}</span>
                  <span className="detail-tag highlight">{selectedJob.salary}</span>
                </div>
                <button
                  className="btn-apply-primary"
                  onClick={() => navigate(`/jobs/${selectedJob._id}/apply`)}
                >
                  Apply Now
                </button>
              </div>

              <hr className="detail-divider" />

              <div className="detail-body">
                <h3>Job Description</h3>
                <p className="description-text">{selectedJob.description}</p>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <>
                    <h3>Requirements</h3>
                    <ul className="requirements-list">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection-placeholder">
              Select a job listing to view complete details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;