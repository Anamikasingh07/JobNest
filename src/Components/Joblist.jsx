import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Jobcard from './Jobcard';
import './Joblist.css';

const INITIAL_JOBS = [
  {
    id: '1', // Matches Google Frontend Developer in Tracker
    title: 'Frontend Developer',
    company: 'Google',
    rating: '4.3',
    reviews: '1,200',
    location: 'Bengaluru',
    workStyle: 'Hybrid',
    jobType: 'Full-time',
    salary: '₹18L – ₹24L a year',
    matchPercentage: 92,
    missingSkill: 'Redux Toolkit',
    postedAgo: 'Posted 2 days ago',
    logoLetter: 'G',
    logoBg: '#1a73e8',
    skills: [
      { name: 'React', matched: true },
      { name: 'Tailwind', matched: true },
      { name: 'Redux', matched: false }
    ],
    responsibilities: 'Build React UIs, optimize web performance, integrate REST APIs.',
    requirements: '2+ years React · Health insurance · Remote days'
  },
  {
    id: '2', // Matches Microsoft Full Stack in Tracker
    title: 'Full Stack Engineer',
    company: 'Microsoft',
    rating: '4.5',
    reviews: '3,400',
    location: 'Hyderabad',
    workStyle: 'On-site',
    jobType: 'Full-time',
    salary: '₹22L – ₹30L a year',
    matchPercentage: 74,
    missingSkill: 'GraphQL',
    postedAgo: 'Posted 4 days ago',
    logoLetter: 'M',
    logoBg: '#f25022',
    skills: [
      { name: 'Node.js', matched: true },
      { name: 'MongoDB', matched: true },
      { name: 'GraphQL', matched: false }
    ],
    responsibilities: 'Design scalable microservices and manage cloud deployments on Azure.',
    requirements: '3+ years Node.js · Provident fund · Annual bonuses'
  }
];

const Joblist = () => {
  const navigate = useNavigate();
  const [jobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(INITIAL_JOBS[0]);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    // Read pre-applied jobs from Tracker state
    const trackerApps = JSON.parse(localStorage.getItem('tracker_applications') || '[]');
    const trackerIds = trackerApps.map((app) => app.id);
    return [...new Set(['1', ...trackerIds])]; // '1' is pre-applied (Google Frontend Developer)
  });

  const handleApply = (job) => {
    if (!appliedJobs.includes(job.id)) {
      const updatedApplied = [...appliedJobs, job.id];
      setAppliedJobs(updatedApplied);

      // Automatically add to Tracker under "Applied"
      const trackerApps = JSON.parse(localStorage.getItem('tracker_applications') || '[]');
      const newTrackerCard = {
        id: job.id,
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        workStyle: job.workStyle,
        salary: job.salary,
        status: 'Applied',
        source: 'Internal',
        appliedDaysAgo: 0,
        badgeText: 'Applied Today',
        badgeType: 'info',
        logoLetter: job.logoLetter,
        logoBg: job.logoBg,
        notes: '',
        interviewDate: '',
        followUpReminder: ''
      };

      localStorage.setItem(
        'tracker_applications',
        JSON.stringify([...trackerApps, newTrackerCard])
      );
    }
  };

  const handleAnalyzeWithAI = () => {
    if (!selectedJob) return;
    // Pass selected job object to AI Page via route state
    navigate('/ai-assistant', {
      state: {
        jobTitle: selectedJob.title,
        companyName: selectedJob.company,
        jobDescription: `${selectedJob.responsibilities}\n\nRequirements:\n${selectedJob.requirements}`
      }
    });
  };

  return (
    <div className="dark-jobs-page">
      <div className="search-bar-row">
        <div className="input-box">
          <span>🔍</span>
          <input type="text" defaultValue="Frontend Developer" placeholder="Job title or keyword" />
        </div>
        <div className="input-box">
          <span>📍</span>
          <input type="text" defaultValue="India" placeholder="Location" />
        </div>
        <button className="btn-find-jobs">Find jobs</button>
      </div>

      <div className="jobs-split-container">
        {/* Left Feed */}
        <div className="jobs-feed-pane">
          {jobs.map((job) => (
            <Jobcard
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id}
              isApplied={appliedJobs.includes(job.id)}
              onClick={() => setSelectedJob(job)}
            />
          ))}
        </div>

        {/* Right Detail Panel */}
        <div className="job-detail-pane">
          {selectedJob && (
            <div className="detail-card-inner">
              <div className="detail-header-row">
                <div className="company-avatar" style={{ backgroundColor: selectedJob.logoBg }}>
                  {selectedJob.logoLetter}
                </div>
                <div>
                  <h2>{selectedJob.title}</h2>
                  <p className="company-subtext">
                    {selectedJob.company} · {selectedJob.location}
                  </p>
                </div>
              </div>

              <div className="detail-action-buttons">
                <button
                  className={`btn-apply-primary ${appliedJobs.includes(selectedJob.id) ? 'applied' : ''}`}
                  onClick={() => handleApply(selectedJob)}
                  disabled={appliedJobs.includes(selectedJob.id)}
                >
                  {appliedJobs.includes(selectedJob.id) ? 'Applied ✓' : 'Apply now'}
                </button>

                {/* Direct AI Match Button */}
                <button className="btn-ai-analyze" onClick={handleAnalyzeWithAI}>
                  ⚡ Analyze with AI
                </button>
              </div>

              <div className="detail-section">
                <h3>Job Description</h3>
                <p>{selectedJob.responsibilities}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Joblist;