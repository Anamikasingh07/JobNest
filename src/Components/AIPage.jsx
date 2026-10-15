import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AIPage.css';

const AIPage = () => {
  const location = useLocation();

  // Active Tool Mode Tab: 'analyzer' | 'cover-letter' | 'interview'
  const [activeTab, setActiveTab] = useState('analyzer');

  // Form Fields
  const [jobTitle, setJobTitle] = useState(
    location.state?.jobTitle || 'Frontend Developer'
  );
  const [companyName, setCompanyName] = useState(
    location.state?.companyName || 'Google'
  );
  const [jobDescription, setJobDescription] = useState(
    location.state?.jobDescription ||
      'Build React UIs, optimize web performance, integrate REST APIs.'
  );

  // States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(88);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state) {
      if (location.state.jobTitle) setJobTitle(location.state.jobTitle);
      if (location.state.companyName) setCompanyName(location.state.companyName);
      if (location.state.jobDescription) setJobDescription(location.state.jobDescription);
    }
  }, [location.state]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setMatchScore(Math.floor(Math.random() * (95 - 78 + 1)) + 78);
    }, 800);
  };

  const generatedCoverLetter = `Dear Hiring Manager at ${companyName},

I am writing to express my strong enthusiasm for the ${jobTitle} role. With over 2 years of experience building responsive web applications using React.js, Node.js, and modern CSS frameworks, I am confident in my ability to deliver immediate value to your engineering team.

Key highlights of my background include:
- Developing performant frontend features and RESTful API integrations.
- Optimizing application state management and modern web performance metrics.
- Collaborating across product and design teams to build user-focused digital experiences.

Thank you for considering my application. I look forward to discussing how my technical background aligns with ${companyName}'s current goals.

Best regards,
Candidate`;

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dark-ai-page">
      {/* Header Bar */}
      <div className="ai-header-bar">
        <div>
          <h1 className="ai-page-title">AI Match Assistant</h1>
          <p className="ai-page-subtitle">
            Evaluate resume compatibility, generate cover letters, and prepare for interviews.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="ai-tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            📊 Resume Match
          </button>
          <button
            className={`tab-btn ${activeTab === 'cover-letter' ? 'active' : ''}`}
            onClick={() => setActiveTab('cover-letter')}
          >
            ✍️ Cover Letter
          </button>
          <button
            className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            💡 Interview Prep
          </button>
        </div>
      </div>

      {location.state && (
        <div className="ai-prefill-banner">
          ✨ Pre-filled with job details for <strong>{jobTitle}</strong> at{' '}
          <strong>{companyName}</strong>
        </div>
      )}

      {/* Main Grid View */}
      <div className="ai-grid-container">
        {/* Left Inputs Pane */}
        <div className="ai-card input-pane">
          <h2 className="card-section-title">Target Job Details</h2>

          <div className="ai-form-group">
            <label className="ai-label">Target Job Title</label>
            <input
              type="text"
              className="ai-input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div className="ai-form-group">
            <label className="ai-label">Company Name</label>
            <input
              type="text"
              className="ai-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google"
            />
          </div>

          <div className="ai-form-group">
            <label className="ai-label">Job Description Requirements</label>
            <textarea
              rows="6"
              className="ai-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste requirements or responsibilities here..."
            />
          </div>

          <button
            type="button"
            className="btn-ai-submit"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing Match...' : 'Calculate AI Match Score'}
          </button>
        </div>

        {/* Right Output Pane */}
        <div className="ai-card output-pane">
          {activeTab === 'analyzer' && (
            <div className="match-analysis-view">
              <h2 className="card-section-title">Resume Compatibility</h2>

              <div className="score-ring-container">
                <div className="score-ring">
                  <span className="score-value">{matchScore}%</span>
                  <span className="score-label">MATCH SCORE</span>
                </div>
              </div>

              <p className="score-summary-text">
                Strong alignment with target role requirements.
              </p>

              <div className="skill-breakdown-section">
                <h3 className="sub-heading">Matched Skills</h3>
                <div className="chips-flex">
                  <span className="skill-chip-ai matched">✓ React.js</span>
                  <span className="skill-chip-ai matched">✓ REST APIs</span>
                  <span className="skill-chip-ai matched">✓ Web Performance</span>
                  <span className="skill-chip-ai matched">✓ JavaScript (ES6+)</span>
                </div>

                <h3 className="sub-heading warning-title">Missing Keywords</h3>
                <div className="chips-flex">
                  <span className="skill-chip-ai missing">✗ Redux Toolkit</span>
                  <span className="skill-chip-ai missing">✗ TypeScript</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cover-letter' && (
            <div className="cover-letter-view">
              <div className="flex-title-row">
                <h2 className="card-section-title">Draft Cover Letter</h2>
                <button
                  className="btn-copy"
                  onClick={() => handleCopyText(generatedCoverLetter)}
                >
                  {copied ? 'Copied ✓' : '📋 Copy to Clipboard'}
                </button>
              </div>

              <textarea
                className="ai-textarea cover-letter-box"
                rows="14"
                value={generatedCoverLetter}
                readOnly
              />
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="interview-prep-view">
              <h2 className="card-section-title">Predicted Interview Questions</h2>
              <div className="questions-list">
                <div className="question-item">
                  <span className="q-badge tech">Technical</span>
                  <h4>How do you optimize render performance in a React application?</h4>
                  <p>
                    <strong>Tip:</strong> Mention `useMemo`, `useCallback`, lazy loading routes, and minimizing unnecessary re-renders.
                  </p>
                </div>

                <div className="question-item">
                  <span className="q-badge behavioral">Behavioral</span>
                  <h4>Describe a time you resolved a conflict within a development team.</h4>
                  <p>
                    <strong>Tip:</strong> Use the STAR method (Situation, Task, Action, Result) focusing on objective collaboration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPage;