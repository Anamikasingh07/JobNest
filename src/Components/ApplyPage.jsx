import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import './ApplyPage.css';

const SAMPLE_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer - React.js',
    company: 'Google',
    location: 'Bengaluru',
    type: 'Full-time',
    questions: [
      { id: 'q1', text: 'How many years of experience do you have with React.js?', required: true },
      { id: 'q2', text: 'Are you comfortable working in a hybrid model in Bengaluru?', required: true },
      { id: 'q3', text: 'What is your notice period?', required: false }
    ]
  },
  {
    id: '2',
    title: 'Full Stack Software Engineer',
    company: 'Microsoft',
    location: 'Hyderabad',
    type: 'Full-time',
    questions: [
      { id: 'q1', text: 'Do you have experience with Node.js microservices?', required: true },
      { id: 'q2', text: 'What is your expected CTC?', required: true }
    ]
  },
  {
    id: '3',
    title: 'Junior Frontend Intern',
    company: 'Acme Tech',
    location: 'Delhi',
    type: 'Internship',
    questions: [] // Tests skipping Step 4 (Employer Questions)
  },
  {
    id: '4',
    title: 'Senior UI/UX Engineer',
    company: 'Adobe',
    location: 'Noida (Remote)',
    type: 'Full-time',
    questions: [
      { id: 'q1', text: 'Please share a link to your Figma portfolio or personal website.', required: true }
    ]
  },
  {
    id: '5',
    title: 'Backend Node.js Developer',
    company: 'Amazon',
    location: 'Bengaluru',
    type: 'Full-time',
    questions: [
      { id: 'q1', text: 'How many years of AWS / Cloud deployment experience do you have?', required: true },
      { id: 'q2', text: 'What is your current notice period (in days)?', required: true }
    ]
  }
];

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [step, setStep] = useState(1); // 1: Contact, 2: Resume, 3: Cover Letter, 4: Employer Questions, 5: Review, 6: Confirmation

  // Step 1: Contact Info
  const [contactInfo, setContactInfo] = useState({
    fullName: 'Test Name',
    email: 'test@email.com',
    phone: '+91 98765 43210',
    location: 'Delhi, India'
  });

  // Step 2: Resume
  const [resumeChoice, setResumeChoice] = useState('saved'); // 'saved' | 'upload'
  const [savedResumeName] = useState('Test_Name_Resume.pdf');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [updateProfileResume, setUpdateProfileResume] = useState(false);

  // Step 3: Cover Letter
  const [coverLetterMode, setCoverLetterMode] = useState('write'); // 'write' | 'none'
  const [coverLetterText, setCoverLetterText] = useState('');

  // Step 4: Questions Answers
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Prefill user contact details from active session if present
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.name || currentUser.email) {
      setContactInfo((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email
      }));
    }

    const foundJob = SAMPLE_JOBS.find((j) => j.id === id) || {
      id: id || '1',
      title: 'Frontend Developer - React.js',
      company: 'Google',
      location: 'Bengaluru',
      type: 'Full-time',
      questions: [
        { id: 'q1', text: 'How many years of experience do you have with React.js?', required: true },
        { id: 'q2', text: 'What is your notice period?', required: false }
      ]
    };
    setJob(foundJob);
  }, [id]);

  const handleNextStep = () => {
    // Skip step 4 if no employer questions
    if (step === 3 && (!job?.questions || job.questions.length === 0)) {
      setStep(5);
    } else {
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    if (step === 5 && (!job?.questions || job.questions.length === 0)) {
      setStep(3);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleGenerateAICoverLetter = () => {
    setCoverLetterText(
      `Dear Hiring Manager at ${job?.company || 'the company'},\n\nI am writing to express my strong enthusiasm for the ${job?.title || 'position'} role. With my background in frontend engineering and building web applications in React.js, I am confident in delivering high quality work for your team.\n\nThank you for considering my application.\n\nBest regards,\n${contactInfo.fullName}`
    );
  };

  const handleSubmitApplication = () => {
    if (!job) return;

    // Add to Tracker applications in LocalStorage
    const trackerApps = JSON.parse(localStorage.getItem('tracker_applications') || '[]');
    const newTrackerCard = {
      id: job.id,
      jobTitle: job.title,
      companyName: job.company,
      location: job.location,
      salary: '18–24 LPA',
      status: 'Applied',
      source: 'Internal',
      appliedDaysAgo: 0,
      badgeText: 'Applied Today',
      logoLetter: job.company.charAt(0),
      logoBg: '#1D4F9F',
      notes: coverLetterText ? `Cover Letter Note: ${coverLetterText.slice(0, 80)}...` : 'Applied via direct application portal.'
    };

    localStorage.setItem(
      'tracker_applications',
      JSON.stringify([...trackerApps.filter((a) => a.id !== job.id), newTrackerCard])
    );

    setStep(6);
  };

  return (
    <div className="focused-apply-page">
      {/* Minimal Header (No Main Navigation) */}
      <header className="minimal-apply-header">
        <div className="header-left">
          <span className="apply-brand-logo">JobNest</span>
          <div className="job-title-pill">
            <strong>{job?.title}</strong> · {job?.company}
          </div>
        </div>

        <button type="button" className="btn-save-close" onClick={() => navigate('/jobs')}>
          Save and close ✕
        </button>
      </header>

      {/* Main Container */}
      <main className="apply-body-container">
        {step < 6 && (
          <div className="step-indicator-bar">
            <span className="step-count">Step {step} of {job?.questions?.length ? 5 : 4}</span>
            <div className="step-progress-track">
              <div
                className="step-progress-fill"
                style={{ width: `${(step / (job?.questions?.length ? 5 : 4)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 1: Contact Information */}
        {step === 1 && (
          <div className="apply-step-card">
            <h2>Contact information</h2>
            <p className="step-subtitle">Prefilled from your profile. Check that your details are up to date.</p>

            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                value={contactInfo.fullName}
                onChange={(e) => setContactInfo({ ...contactInfo, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone number</label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={contactInfo.location}
                  onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
                />
              </div>
            </div>

            <div className="step-nav-actions">
              <button type="button" className="btn-primary-continue" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Resume */}
        {step === 2 && (
          <div className="apply-step-card">
            <h2>Select a resume</h2>
            <p className="step-subtitle">Upload a resume or select a saved document for this application.</p>

            <div className="resume-options-list">
              <label className={`resume-radio-card ${resumeChoice === 'saved' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="resume"
                  checked={resumeChoice === 'saved'}
                  onChange={() => setResumeChoice('saved')}
                />
                <div className="resume-card-info">
                  <strong>📄 {savedResumeName}</strong>
                  <p>Default profile resume</p>
                </div>
              </label>

              <label className={`resume-radio-card ${resumeChoice === 'upload' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="resume"
                  checked={resumeChoice === 'upload'}
                  onChange={() => setResumeChoice('upload')}
                />
                <div className="resume-card-info">
                  <strong>📤 Upload a new resume</strong>
                  <p>PDF, DOCX (max 5MB)</p>
                </div>
              </label>
            </div>

            {resumeChoice === 'upload' && (
              <div className="file-upload-box">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewResumeFile(e.target.files[0])}
                />
                {newResumeFile && <p className="uploaded-filename">Selected: {newResumeFile.name}</p>}
              </div>
            )}

            <div className="checkbox-option-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={updateProfileResume}
                  onChange={(e) => setUpdateProfileResume(e.target.checked)}
                />
                Update my primary profile resume with this document
              </label>
              <p className="checkbox-hint">If unchecked, this resume will be used only for this application.</p>
            </div>

            <div className="step-nav-actions">
              <button type="button" className="btn-secondary-back" onClick={handlePrevStep}>
                Back
              </button>
              <button type="button" className="btn-primary-continue" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Cover Letter */}
        {step === 3 && (
          <div className="apply-step-card">
            <h2>Add a cover letter (optional)</h2>
            <p className="step-subtitle">Introduce yourself to the recruiter or let AI generate a draft.</p>

            <div className="cover-letter-toolbar">
              <button
                type="button"
                className="btn-ai-generate"
                onClick={handleGenerateAICoverLetter}
              >
                ✨ Generate with AI Assistant
              </button>
            </div>

            <div className="form-group">
              <textarea
                rows="8"
                placeholder="Write your cover letter here..."
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
              />
            </div>

            <div className="step-nav-actions">
              <button type="button" className="btn-secondary-back" onClick={handlePrevStep}>
                Back
              </button>
              <button type="button" className="btn-primary-continue" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Employer Questions */}
        {step === 4 && job?.questions && job.questions.length > 0 && (
          <div className="apply-step-card">
            <h2>Employer questions</h2>
            <p className="step-subtitle">Please answer the recruiter's specific questions for this role.</p>

            {job.questions.map((q) => (
              <div key={q.id} className="form-group">
                <label>
                  {q.text} {q.required && <span className="required-star">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="Your response..."
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              </div>
            ))}

            <div className="step-nav-actions">
              <button type="button" className="btn-secondary-back" onClick={handlePrevStep}>
                Back
              </button>
              <button type="button" className="btn-primary-continue" onClick={handleNextStep}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Review Application */}
        {step === 5 && (
          <div className="apply-step-card">
            <h2>Review your application</h2>
            <p className="step-subtitle">Please review your information carefully. Applications cannot be edited after submission.</p>

            <div className="review-section-box">
              <div className="review-header flex">
                <h3>Contact Information</h3>
                <button type="button" className="btn-edit-link" onClick={() => setStep(1)}>Edit</button>
              </div>
              <p><strong>{contactInfo.fullName}</strong></p>
              <p>{contactInfo.email} · {contactInfo.phone}</p>
              <p>{contactInfo.location}</p>
            </div>

            <div className="review-section-box">
              <div className="review-header flex">
                <h3>Resume</h3>
                <button type="button" className="btn-edit-link" onClick={() => setStep(2)}>Edit</button>
              </div>
              <p>📄 {resumeChoice === 'saved' ? savedResumeName : (newResumeFile?.name || 'Uploaded Resume')}</p>
            </div>

            {coverLetterText && (
              <div className="review-section-box">
                <div className="review-header flex">
                  <h3>Cover Letter</h3>
                  <button type="button" className="btn-edit-link" onClick={() => setStep(3)}>Edit</button>
                </div>
                <p className="cover-preview-snippet">{coverLetterText.slice(0, 140)}...</p>
              </div>
            )}

            {job?.questions && job.questions.length > 0 && (
              <div className="review-section-box">
                <div className="review-header flex">
                  <h3>Employer Questions</h3>
                  <button type="button" className="btn-edit-link" onClick={() => setStep(4)}>Edit</button>
                </div>
                {job.questions.map((q) => (
                  <p key={q.id}>
                    <strong>{q.text}:</strong> {answers[q.id] || 'N/A'}
                  </p>
                ))}
              </div>
            )}

            <div className="step-nav-actions">
              <button type="button" className="btn-secondary-back" onClick={handlePrevStep}>
                Back
              </button>
              <button type="button" className="btn-primary-submit" onClick={handleSubmitApplication}>
                Submit your application
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation */}
        {step === 6 && (
          <div className="apply-step-card confirmation-card">
            <div className="success-icon-circle">✓</div>
            <h2>Application submitted!</h2>
            <p className="step-subtitle">
              Your application for <strong>{job?.title}</strong> at <strong>{job?.company}</strong> has been sent. This job is now added to your <strong>Application Tracker</strong>.
            </p>

            <div className="confirmation-actions">
              <button type="button" className="btn-primary-continue" onClick={() => navigate('/tracker')}>
                Go to Application Tracker
              </button>
              <button type="button" className="btn-secondary-back" onClick={() => navigate('/jobs')}>
                Find More Jobs
              </button>
            </div>

            {/* Suggested Similar Jobs */}
            <div className="suggested-jobs-section">
              <h3>Suggested similar jobs</h3>
              <div className="suggested-jobs-grid">
                <div className="suggested-job-tile" onClick={() => navigate('/jobs')}>
                  <h4>Full Stack Software Engineer</h4>
                  <p>Microsoft · Hyderabad</p>
                  <span className="pill-link">View Job →</span>
                </div>
                <div className="suggested-job-tile" onClick={() => navigate('/jobs')}>
                  <h4>React.js Frontend Engineer</h4>
                  <p>Amazon · Remote</p>
                  <span className="pill-link">View Job →</span>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplyPage;