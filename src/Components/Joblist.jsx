import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Joblist.css';

const INITIAL_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer - React.js',
    company: 'Google',
    location: 'Bengaluru',
    workMode: 'Hybrid',
    type: 'Full-time',
    experience: 'Intermediate (1-3 yrs)',
    postedBy: 'Priya Sharma',
    salary: '₹18L – ₹24L',
    salaryNum: 18,
    salaryUnit: 'a year',
    matchPercentage: 92,
    postedAgoDays: 2,
    postedAgo: 'Posted 2 days ago',
    logoLetter: 'G',
    logoBg: '#E6ECF6',
    logoColor: '#1D4F9F',
    matchedSkills: ['React', 'Tailwind', 'REST APIs'],
    missingSkills: ['Redux Toolkit'],
    about: 'Build and maintain high-scale React applications, optimize web performance, and integrate REST APIs with cross-functional teams.',
    requirements: [
      '2+ years of experience with React',
      'Working knowledge of Redux and Tailwind CSS',
      'Experience with responsive, accessible interfaces'
    ]
  },
  {
    id: '2',
    title: 'Full Stack Software Engineer',
    company: 'Microsoft',
    location: 'Hyderabad',
    workMode: 'On-site',
    type: 'Full-time',
    experience: 'Experienced (3-5 yrs)',
    postedBy: 'Recruiter Admin',
    salary: '₹22L – ₹30L',
    salaryNum: 22,
    salaryUnit: 'a year',
    matchPercentage: 74,
    postedAgoDays: 4,
    postedAgo: 'Posted 4 days ago',
    logoLetter: 'M',
    logoBg: '#E6ECF6',
    logoColor: '#1D4F9F',
    matchedSkills: ['Node.js', 'MongoDB', 'REST APIs'],
    missingSkills: ['GraphQL', 'Docker'],
    about: 'Design microservices architecture, implement scalable server APIs, and manage front-end application state.',
    requirements: [
      '3+ years full stack software development',
      'Proficiency in React and Node.js backend services',
      'Experience with relational and non-relational databases'
    ]
  },
  {
    id: '3',
    title: 'Junior Frontend Intern',
    company: 'Acme Tech',
    location: 'Delhi',
    workMode: 'Remote',
    type: 'Internship',
    experience: 'Fresher / Entry-level',
    postedBy: 'HR Team',
    salary: '₹6L – ₹10L',
    salaryNum: 6,
    salaryUnit: 'a year',
    matchPercentage: 88,
    postedAgoDays: 1,
    postedAgo: 'Posted 1 day ago',
    logoLetter: 'A',
    logoBg: '#E6ECF6',
    logoColor: '#1D4F9F',
    matchedSkills: ['HTML', 'CSS', 'JavaScript'],
    missingSkills: ['React'],
    about: 'Assist senior developers in building responsive landing pages and user interfaces.',
    requirements: ['Fresh graduate or final year CS student', 'Basic knowledge of HTML/CSS/JS']
  }
];

const FILTER_CONFIG = {
  'Experience': ['All', 'Fresher / Entry-level', 'Intermediate (1-3 yrs)', 'Experienced (3-5 yrs)', 'Senior (5+ yrs)'],
  'Salary': ['All', 'Under ₹10L', '₹10L – ₹20L', '₹20L+'],
  'Job type': ['All', 'Full-time', 'Part-time', 'Internship', 'Contract'],
  'Work mode': ['All', 'Hybrid', 'On-site', 'Remote'],
  'Date posted': ['All', 'Past 24 hours', 'Past week', 'Past month']
};

const Joblist = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [jobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(INITIAL_JOBS[0]);
  const [searchTitle, setSearchTitle] = useState('Developer');
  const [searchLocation, setSearchLocation] = useState('India');
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Filter Dropdown States
  const [activeOpenDropdown, setActiveOpenDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    'Experience': 'All',
    'Salary': 'All',
    'Job type': 'All',
    'Work mode': 'All',
    'Date posted': 'All'
  });

  const [appliedJobs, setAppliedJobs] = useState(() => {
    const trackerApps = JSON.parse(localStorage.getItem('tracker_applications') || '[]');
    const trackerIds = trackerApps.map((app) => app.id);
    return [...new Set(['1', ...trackerIds])];
  });

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFilterValue = (category, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: value
    }));
    setActiveOpenDropdown(null);
  };

  const handleApply = (job) => {
    if (!appliedJobs.includes(job.id)) {
      const updatedApplied = [...appliedJobs, job.id];
      setAppliedJobs(updatedApplied);

      const trackerApps = JSON.parse(localStorage.getItem('tracker_applications') || '[]');
      const newTrackerCard = {
        id: job.id,
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        salary: `${job.salary} ${job.salaryUnit}`,
        status: 'Applied',
        source: 'Internal',
        appliedDaysAgo: 0,
        badgeText: 'Applied Today',
        logoLetter: job.logoLetter,
        logoBg: '#1D4F9F'
      };

      localStorage.setItem(
        'tracker_applications',
        JSON.stringify([...trackerApps, newTrackerCard])
      );
    }
  };

  const handleToggleSave = (jobId) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleAnalyzeWithAI = () => {
    if (!selectedJob) return;
    navigate('/ai-assistant', {
      state: {
        jobTitle: selectedJob.title,
        companyName: selectedJob.company,
        jobDescription: `${selectedJob.about}\n\nRequirements:\n${selectedJob.requirements.join('\n')}`
      }
    });
  };

  // Filter Jobs dynamically
  const filteredJobs = jobs.filter((job) => {
    // Title & Location
    const matchesTitle = job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                            searchLocation.toLowerCase() === 'india' || !searchLocation;

    // Experience Filter
    const expFilter = selectedFilters['Experience'];
    const matchesExp = expFilter === 'All' || job.experience === expFilter;

    // Work Mode Filter
    const modeFilter = selectedFilters['Work mode'];
    const matchesMode = modeFilter === 'All' || job.workMode === modeFilter;

    // Job Type Filter
    const typeFilter = selectedFilters['Job type'];
    const matchesType = typeFilter === 'All' || job.type === typeFilter;

    // Salary Filter
    const salFilter = selectedFilters['Salary'];
    let matchesSal = true;
    if (salFilter === 'Under ₹10L') matchesSal = job.salaryNum < 10;
    else if (salFilter === '₹10L – ₹20L') matchesSal = job.salaryNum >= 10 && job.salaryNum <= 20;
    else if (salFilter === '₹20L+') matchesSal = job.salaryNum >= 20;

    // Date Posted Filter
    const dateFilter = selectedFilters['Date posted'];
    let matchesDate = true;
    if (dateFilter === 'Past 24 hours') matchesDate = job.postedAgoDays <= 1;
    else if (dateFilter === 'Past week') matchesDate = job.postedAgoDays <= 7;
    else if (dateFilter === 'Past month') matchesDate = job.postedAgoDays <= 30;

    return matchesTitle && matchesLocation && matchesExp && matchesMode && matchesType && matchesSal && matchesDate;
  });

  return (
    <div className="find-jobs-page-container">
      {/* Search Header Container */}
      <div className="search-header-box">
        <div className="search-inputs-flex">
          <div className="field-group">
            <label className="field-label">Job title or skill</label>
            <input
              type="text"
              className="search-input"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="e.g. Developer or React"
            />
          </div>

          <div className="field-group">
            <label className="field-label">Location</label>
            <input
              type="text"
              className="search-input"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="e.g. India or Remote"
            />
          </div>

          <button type="button" className="btn-search-primary">
            Search
          </button>
        </div>

        {/* Filter Pills with Dropdown Menus */}
        <div className="filter-pills-row" ref={dropdownRef}>
          {Object.keys(FILTER_CONFIG).map((category) => {
            const isSelected = selectedFilters[category] !== 'All';
            const isOpen = activeOpenDropdown === category;

            return (
              <div key={category} className="filter-pill-wrapper">
                <button
                  type="button"
                  className={`pill-btn ${isSelected || isOpen ? 'active' : ''}`}
                  onClick={() =>
                    setActiveOpenDropdown(isOpen ? null : category)
                  }
                >
                  {isSelected ? `${category}: ${selectedFilters[category]}` : category} ▾
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="filter-dropdown-menu">
                    <div className="filter-dropdown-header">{category}</div>
                    {FILTER_CONFIG[category].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`filter-dropdown-item ${
                          selectedFilters[category] === opt ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectFilterValue(category, opt)}
                      >
                        {opt} {selectedFilters[category] === opt ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Reset Filters button if any active */}
          {Object.values(selectedFilters).some((v) => v !== 'All') && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={() =>
                setSelectedFilters({
                  'Experience': 'All',
                  'Salary': 'All',
                  'Job type': 'All',
                  'Work mode': 'All',
                  'Date posted': 'All'
                })
              }
            >
              Reset filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Jobs Feed & Detail Pane View */}
      <div className="jobs-content-grid">
        {/* Left Column: Job Cards */}
        <div className="jobs-feed-column">
          <div className="feed-header-row">
            <span className="jobs-count-text">{filteredJobs.length} jobs found</span>
            <span className="sort-by-text">
              Sort: <strong>Most relevant</strong>
            </span>
          </div>

          <div className="cards-stack">
            {filteredJobs.length === 0 ? (
              <div className="no-jobs-found-box">
                <p>No jobs match your selected criteria.</p>
                <button
                  type="button"
                  className="pill-btn active"
                  onClick={() =>
                    setSelectedFilters({
                      'Experience': 'All',
                      'Salary': 'All',
                      'Job type': 'All',
                      'Work mode': 'All',
                      'Date posted': 'All'
                    })
                  }
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    className={`job-card-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="card-header flex">
                      <div
                        className="company-logo-tile"
                        style={{
                          backgroundColor: job.logoBg,
                          color: job.logoColor
                        }}
                      >
                        {job.logoLetter}
                      </div>
                      <div className="title-company-meta">
                        <h3 className="card-job-title">{job.title}</h3>
                        <p className="card-company-location">
                          {job.company} · {job.location}
                        </p>
                      </div>
                    </div>

                    <p className="card-salary-text">
                      {job.salary} <span className="unit">{job.salaryUnit}</span>
                    </p>

                    <div className="card-badges-row">
                      <span className="tag-pill">{job.type}</span>
                      <span className="tag-pill">{job.workMode}</span>
                      <span className="tag-pill exp-badge">{job.experience}</span>
                      <span className="tag-pill match-badge">
                        {job.matchPercentage}% match
                      </span>
                    </div>

                    <p className="posted-ago-text">{job.postedAgo}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Job Details Pane */}
        <div className="job-detail-panel">
          {selectedJob && (
            <div className="detail-pane-inner">
              <div className="detail-header-flex">
                <div className="title-section">
                  <h1 className="detail-job-title">{selectedJob.title}</h1>
                  <p className="detail-company-meta">
                    {selectedJob.company} · {selectedJob.location},{' '}
                    {selectedJob.workMode} · {selectedJob.type} · {selectedJob.experience}
                  </p>
                </div>

                <div className="detail-action-buttons">
                  <button
  type="button"
  className={`btn-apply-now ${appliedJobs.includes(selectedJob.id) ? 'applied' : ''}`}
  onClick={() => navigate(`/jobs/${selectedJob.id}/apply`)}
  disabled={appliedJobs.includes(selectedJob.id)}
>
  {appliedJobs.includes(selectedJob.id) ? 'Applied ✓' : 'Apply now'}
</button>

                  <button
                    type="button"
                    className={`btn-save-outline ${
                      savedJobIds.includes(selectedJob.id) ? 'saved' : ''
                    }`}
                    onClick={() => handleToggleSave(selectedJob.id)}
                  >
                    {savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save'}
                  </button>

                  <button
                    type="button"
                    className="btn-ai-assistant"
                    onClick={handleAnalyzeWithAI}
                  >
                    🤖 Analyze with AI
                  </button>
                </div>
              </div>

              <p className="detail-salary-text">
                {selectedJob.salary}{' '}
                <span className="unit">{selectedJob.salaryUnit}</span>
              </p>

              <div className="resume-match-card">
                <div className="match-bar-top">
                  <span className="match-title">Resume match</span>
                  <span className="match-percent">
                    {selectedJob.matchPercentage}%
                  </span>
                </div>

                <div className="progress-track-bg">
                  <div
                    className="progress-track-fill"
                    style={{ width: `${selectedJob.matchPercentage}%` }}
                  ></div>
                </div>

                <p className="match-skills-breakdown">
                  <strong>Matched:</strong>{' '}
                  {selectedJob.matchedSkills.join(', ')} ·{' '}
                  <strong>Missing:</strong>{' '}
                  {selectedJob.missingSkills.join(', ')}
                </p>
              </div>

              <div className="detail-section">
                <h3 className="section-title">About the role</h3>
                <p className="section-paragraph">{selectedJob.about}</p>
              </div>

              <div className="detail-section">
                <h3 className="section-title">Requirements</h3>
                <ul className="requirements-bullet-list">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Joblist;