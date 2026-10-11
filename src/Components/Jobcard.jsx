import React from 'react';
import './Jobcard.css';

const Jobcard = ({ job, isSelected, isSaved, onClick, onSave }) => {
  return (
    <div className={`dark-job-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="card-top-group">
        <div className="card-avatar" style={{ backgroundColor: job.logoBg }}>
          {job.logoLetter}
        </div>
        <div className="card-title-block">
          <h3 className="card-job-title">{job.title}</h3>
          <p className="card-company-name">
            {job.company} · {job.location}
          </p>
        </div>
        <button
          className="btn-bookmark"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          {isSaved ? '❤️' : '🔖'}
        </button>
      </div>

      <div className="card-salary">{job.salary}</div>

      <div className="card-pills-row">
        <span className="pill-gray">{job.jobType}</span>
        <span className="pill-gray">{job.workStyle}</span>
        <span className={`pill-match ${job.matchPercentage > 80 ? 'high' : 'medium'}`}>
          {job.matchPercentage}% match
        </span>
      </div>

      <div className="card-footer-ago">{job.postedAgo}</div>
    </div>
  );
};

export default Jobcard;