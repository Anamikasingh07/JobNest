import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AIPage.css';

const AIPage = () => {
  const location = useLocation();

  // Read pre-filled values if passed from "Analyze with AI" button on Jobs page
  const initialJobTitle = location.state?.jobTitle || 'Frontend Developer';
  const initialCompanyName = location.state?.companyName || 'Google';
  const initialJobDesc =
    location.state?.jobDescription ||
    'Build React UIs, optimize web performance, integrate REST APIs.';

  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [jobDescription, setJobDescription] = useState(initialJobDesc);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(88);

  useEffect(() => {
    if (location.state) {
      setJobTitle(location.state.jobTitle || '');
      setCompanyName(location.state.companyName || '');
      setJobDescription(location.state.jobDescription || '');
    }
  }, [location.state]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setMatchScore(Math.floor(Math.random() * (95 - 78 + 1)) + 78);
    }, 800);
  };

  return (
    <div className="dark-ai-page">
      <h1>AI Match Assistant</h1>
      {location.state && (
        <div className="ai-prefill-banner">
          ✨ Pre-filled with details for <strong>{jobTitle}</strong> at <strong>{companyName}</strong>
        </div>
      )}

      <div className="ai-grid-container">
        {/* Left Inputs */}
        <div className="ai-input-card">
          <div className="form-group">
            <label>Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Job Description Requirements</label>
            <textarea
              rows="6"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <button className="btn-primary-blue" onClick={handleRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing Match...' : 'Calculate AI Match Score'}
          </button>
        </div>

        {/* Right Output */}
        <div className="ai-result-card">
          <h3>Resume Match Score</h3>
          <div className="match-score-circle">
            <span className="score-num">{matchScore}%</span>
          </div>
          <p className="score-subtext">Strong alignment with core React & Frontend requirements.</p>
        </div>
      </div>
    </div>
  );
};

export default AIPage;