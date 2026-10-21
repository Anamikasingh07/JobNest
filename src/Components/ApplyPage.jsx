import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import { getProfileCompletion } from '../utils/profileCompletion';
import './ApplyPage.css';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [step, setStep] = useState(1); // 1: Contact, 2: Resume, 3: Cover Letter, 4: Questions, 5: Review, 6: Confirmation
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Contact Details
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: ''
  });

  // Step 2: Resume Selection
  const [resumeChoice, setResumeChoice] = useState('saved');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [updateProfileResume, setUpdateProfileResume] = useState(false);

  // Step 3: Cover Letter
  const [coverLetterText, setCoverLetterText] = useState('');

  // Step 4: Employer Questions Responses
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    API.get('/auth/profile')
      .then(async ({ data }) => {
        const profileWithResume = data.hasResume
          ? { ...data, ...(await API.get('/auth/profile/resume')).data }
          : data;
        setCandidateProfile(profileWithResume);
        setContactInfo((prev) => ({
          ...prev,
          fullName: data.name || '', email: data.email || '',
          phone: data.phone || '', location: data.location || ''
        }));
      })
      .catch((error) => setProfileLoadError(error.response?.data?.message || 'Could not verify your candidate profile.'))
      .finally(() => setProfileLoading(false));

    // 2. Fetch Job Details from backend (with fallback to local check)
    const fetchJobDetails = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setValidationError(err.response?.status === 404
          ? 'This job posting was deleted or is no longer available.'
          : 'Could not load this job posting. Please try again.');
      }
    };

    if (id) fetchJobDetails();
  }, [id]);

  const profileCompletion = getProfileCompletion(candidateProfile, 'candidate');
  const savedResumeName = candidateProfile?.resumeName || '';

  // Handle Stepper Validation & Transitions
  const handleNextStep = () => {
    setValidationError('');

    // ENFORCE MANDATORY QUESTION VALIDATION AT STEP 4
    if (step === 4 && job?.questions && job.questions.length > 0) {
      for (const q of job.questions) {
        if (q.required) {
          const qId = q.id || q._id;
          const userAns = answers[qId] || answers[q.text];
          if (!userAns || userAns.trim() === '') {
            setValidationError(`Please fill out the required question: "${q.text || q.questionText}"`);
            return;
          }
        }
      }
    }

    // Skip Step 4 if no screening questions exist for this role
    if (step === 3 && (!job?.questions || job.questions.length === 0)) {
      setStep(5);
    } else {
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    if (step === 5 && (!job?.questions || job.questions.length === 0)) {
      setStep(3);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleGenerateAICoverLetter = () => {
    setCoverLetterText(
      `Dear Hiring Manager at ${job?.company || job?.companyName || 'the company'},\n\nI am writing to express my strong enthusiasm for the ${job?.title || 'position'} role. With my background in software engineering, I am confident in delivering high quality work for your team.\n\nThank you for considering my application.\n\nBest regards,\n${contactInfo.fullName}`
    );
  };

  const handleSubmitApplication = async () => {
    const jobIdToSubmit = job?._id || job?.id || id;
    if (!jobIdToSubmit || jobIdToSubmit === 'undefined') {
      setValidationError('This job posting is unavailable. Return to Find Jobs and choose an active listing.');
      return;
    }
    if (resumeChoice === 'upload' && !newResumeFile) {
      setValidationError('Choose a resume file before submitting your application.');
      setStep(2);
      return;
    }
    setValidationError('');
    setSubmitting(true);

    // Format screening answers array for the database
    const formattedAnswers = (job.questions || []).map((q) => ({
      questionText: q.text || q.questionText,
      answerText: answers[q.id || q._id] || answers[q.text] || ''
    }));

    try {
      let resumeData = resumeChoice === 'saved' ? (candidateProfile?.resumeData || '') : '';
      if (resumeChoice === 'upload' && newResumeFile) {
        resumeData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
          reader.onerror = () => reject(new Error('Could not read the selected resume file.'));
          reader.readAsDataURL(newResumeFile);
        });
      }

      // Store the resume and candidate details with the application for recruiter review.
      await API.post(`/applications/${jobIdToSubmit}`, {
        answers: formattedAnswers,
        applicantDetails: contactInfo,
        resume: {
          name: resumeChoice === 'upload' ? newResumeFile.name : savedResumeName,
          contentType: resumeChoice === 'upload' ? newResumeFile.type : (candidateProfile?.resumeContentType || ''),
          data: resumeData
        },
        coverLetter: coverLetterText
      });

      // 2. Sync to local tracker state for frontend continuity
      const signedInUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const trackerStorageKey = `tracker_applications:${signedInUser._id || signedInUser.email || 'guest'}`;
      const trackerApps = JSON.parse(localStorage.getItem(trackerStorageKey) || '[]');
      const newTrackerCard = {
        id: jobIdToSubmit,
        jobTitle: job.title,
        companyName: job.company || job.companyName,
        location: job.location,
        salary: job.salary || 'Competitive',
        status: 'Applied',
        source: 'Internal',
        appliedDaysAgo: 0,
        badgeText: 'Applied Today',
        logoLetter: (job.company || job.companyName || 'J').charAt(0),
        logoBg: '#1D4F9F',
        notes: coverLetterText ? `Cover Letter: ${coverLetterText.slice(0, 80)}...` : 'Applied via direct portal.'
      };

      localStorage.setItem(
        trackerStorageKey,
        JSON.stringify([...trackerApps.filter((a) => a.id !== jobIdToSubmit), newTrackerCard])
      );

      setStep(6);
    } catch (err) {
      setValidationError(
        err.response?.data?.message || err.message || 'Could not submit your application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return <div className="focused-apply-page"><main className="apply-body-container"><div className="apply-step-card"><h2>Checking your profile...</h2></div></main></div>;
  }

  if (profileLoadError || !profileCompletion.complete) {
    return (
      <div className="focused-apply-page">
        <header className="minimal-apply-header"><span className="apply-brand-logo">JobNest</span><button type="button" className="btn-save-close" onClick={() => navigate('/jobs')}>Back to jobs</button></header>
        <main className="apply-body-container"><div className="apply-step-card">
          <h2>Complete your candidate profile to apply</h2>
          <p className="step-subtitle">{profileLoadError || `Add these details to your profile first: ${profileCompletion.missing.join(', ')}.`}</p>
          <div className="step-nav-actions"><button type="button" className="btn-primary-continue" onClick={() => navigate('/profile')}>Complete profile</button></div>
        </div></main>
      </div>
    );
  }

  return (
    <div className="focused-apply-page">
      {/* Header */}
      <header className="minimal-apply-header">
        <div className="header-left">
          <span className="apply-brand-logo">JobNest</span>
          <div className="job-title-pill">
            <strong>{job?.title}</strong> · {job?.company || job?.companyName}
          </div>
        </div>

        <button type="button" className="btn-save-close" onClick={() => navigate('/jobs')}>
          Save and close ✕
        </button>
      </header>

      {/* Main Form Body */}
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

        {/* Global Error Banner */}
        {validationError && (
          <div className="validation-error-banner" style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⚠️ {validationError}
          </div>
        )}

        {/* STEP 1: Contact Information */}
        {step === 1 && (
          <div className="apply-step-card">
            <h2>Contact information</h2>
            <p className="step-subtitle">Check that your details are up to date.</p>

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
            <p className="step-subtitle">Upload a resume or select a saved document.</p>

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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 5 * 1024 * 1024) {
                      setValidationError('Resume must be 5 MB or smaller.');
                      e.target.value = '';
                      setNewResumeFile(null);
                      return;
                    }
                    setValidationError('');
                    setNewResumeFile(file || null);
                  }}
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
            <p className="step-subtitle">Introduce yourself to the recruiter or generate a draft with AI.</p>

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

        {/* STEP 4: Employer Questions (STRICT VALIDATION APPLIED) */}
        {step === 4 && job?.questions && job.questions.length > 0 && (
          <div className="apply-step-card">
            <h2>Employer questions</h2>
            <p className="step-subtitle">Please answer all required questions from the employer.</p>

            {job.questions.map((q) => {
              const key = q.id || q._id || q.text;
              return (
                <div key={key} className="form-group">
                  <label>
                    {q.text || q.questionText} {q.required && <span className="required-star" style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    type="text"
                    required={q.required}
                    placeholder="Your response..."
                    value={answers[key] || ''}
                    onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                  />
                </div>
              );
            })}

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
            <p className="step-subtitle">Review your responses before submitting.</p>

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
                {job.questions.map((q) => {
                  const key = q.id || q._id || q.text;
                  return (
                    <p key={key}>
                      <strong>{q.text || q.questionText}:</strong> {answers[key] || 'N/A'}
                    </p>
                  );
                })}
              </div>
            )}

            <div className="step-nav-actions">
              <button type="button" className="btn-secondary-back" onClick={handlePrevStep}>
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                className="btn-primary-submit"
                onClick={handleSubmitApplication}
              >
                {submitting ? 'Submitting...' : 'Submit your application'}
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
              Your application for <strong>{job?.title}</strong> at <strong>{job?.company || job?.companyName}</strong> has been sent. This job is now added to your <strong>Application Tracker</strong>.
            </p>

            <div className="confirmation-actions">
              <button type="button" className="btn-primary-continue" onClick={() => navigate('/tracker')}>
                Go to Application Tracker
              </button>
              <button type="button" className="btn-secondary-back" onClick={() => navigate('/jobs')}>
                Find More Jobs
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplyPage;
