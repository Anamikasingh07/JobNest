import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import './Joblist.css';

const SKILL_CATALOG = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Java', 'C++', 'C#', 'SQL', 'HTML', 'CSS', 'Tailwind', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Figma', 'Machine Learning', 'Communication', 'Project Management'];
const normalizeSkill = (skill) => String(skill).toLowerCase().replace(/[^a-z0-9]/g, '');
const getCompanyName = (job) => {
  const savedName = String(job.companyName || job.company || '').trim();
  if (savedName && savedName.toLowerCase() !== 'company') return savedName;
  return job.postedBy?.companyName || job.recruiter?.companyName || job.postedBy?.name || job.recruiter?.name || 'Company name not provided';
};
const getRequiredSkills = (job) => {
  if (Array.isArray(job.skills) && job.skills.length) return job.skills;
  const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
  return SKILL_CATALOG.filter((skill) => {
    if (skill === 'Java' && text.includes('javascript')) return false;
    return text.includes(skill.toLowerCase());
  });
};

const getPostedAge = (createdAt) => {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return 'date unavailable';
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
  if (days === 0) return 'today';
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  const [candidateSkills, setCandidateSkills] = useState([]);
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

  useEffect(() => {
    API.get('/auth/profile').then(({ data }) => setCandidateSkills(data.skills || [])).catch(() => setCandidateSkills([]));
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTitle) params.title = searchTitle;
      if (searchLocation) params.location = searchLocation;
      if (experience !== 'All') params.experience = experience;
      if (workMode !== 'All') params.workMode = workMode;
      if (jobType !== 'All') params.type = jobType;

      const [jobsResponse, applicationsResponse] = await Promise.all([
        API.get('/jobs', { params }),
        API.get('/applications/candidate').catch(() => ({ data: [] }))
      ]);
      const jobList = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
      const appliedIds = new Set((applicationsResponse.data || []).map((application) => {
        const appliedJob = application.job;
        return String(appliedJob?._id || appliedJob || '');
      }).filter(Boolean));
      setJobs(jobList);
      setAppliedJobIds(appliedIds);
      if (jobList.length > 0) {
        setSelectedJob(jobList[0]);
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

  const requiredSkills = selectedJob ? getRequiredSkills(selectedJob) : [];
  const candidateSkillSet = new Set(candidateSkills.map(normalizeSkill));
  const matchingSkills = requiredSkills.filter((skill) => candidateSkillSet.has(normalizeSkill(skill)));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkillSet.has(normalizeSkill(skill)));
  const matchScore = requiredSkills.length ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : null;

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
                <p className="card-company-name">{getCompanyName(job)}</p>
                <p className="card-location-meta">{job.location} ({job.workMode || 'On-site'})</p>
                <div className="job-card-required-skills" aria-label="Required skills">
                  {getRequiredSkills(job).length ? getRequiredSkills(job).map((skill) => (
                    <span className={`job-match-skill ${candidateSkillSet.has(normalizeSkill(skill)) ? 'matched' : 'missing'}`} key={`${job._id}-${skill}`}>{skill}</span>
                  )) : <span className="job-card-no-skills">No required skills listed</span>}
                </div>
                <p className="card-posted-age">Posted {getPostedAge(job.createdAt)}</p>
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
                  {selectedJob.companyName || selectedJob.company || 'Company'} {selectedJob.location ? `• ${selectedJob.location}` : ''}
                </p>
                <p className="detail-posted-age">Posted {getPostedAge(selectedJob.createdAt)}</p>
                <div className="detail-tags">
                  <span className="detail-tag">{selectedJob.employmentType || selectedJob.type || 'Full-time'}</span>
                  <span className="detail-tag">{selectedJob.workMode || 'On-site'}</span>
                  <span className="detail-tag highlight">{selectedJob.salary}</span>
                </div>
                {appliedJobIds.has(String(selectedJob._id)) ? (
                  <span className="job-applied-label" role="status">Applied</span>
                ) : (
                  <button
                    className="btn-apply-primary"
                    disabled={!selectedJob._id}
                    onClick={() => selectedJob._id && navigate(`/jobs/${selectedJob._id}/apply`)}
                  >Apply Now</button>
                )}
              </div>

              <hr className="detail-divider" />

              <div className="detail-body">
                <section className="job-skill-match">
                  <h3>ATS compatibility score</h3>
                  {matchScore === null ? (
                    <p>This employer has not listed specific skills for this job yet.</p>
                  ) : (
                    <>
                      <p className="job-match-score">{matchScore}% ATS-style profile match</p>
                      <p>{matchScore >= 80 ? 'Strong skill match — these skills can help your application stand out.' : matchScore >= 50 ? 'Some relevant skills match and may strengthen your application.' : 'A few required skills match; review the missing skills below.'} The estimate compares your listed skills with this job’s listed skills; it does not predict a hiring decision.</p>
                      <div className="job-match-skill-groups">
                        <div><strong>Skills requested by the recruiter</strong><div>{requiredSkills.map((skill) => {
                          const matched = candidateSkillSet.has(normalizeSkill(skill));
                          return <span className={`job-match-skill ${matched ? 'matched' : 'missing'}`} key={`required-${skill}`}>{matched ? '✓ ' : '× '}{skill}</span>;
                        })}</div></div>
                        <div className="job-match-legend"><span className="job-match-skill matched">Matches your profile</span><span className="job-match-skill missing">Not listed in your profile</span></div>
                      </div>
                      {!candidateSkills.length && <p>Add your skills in your profile to get a more useful comparison.</p>}
                    </>
                  )}
                </section>
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
