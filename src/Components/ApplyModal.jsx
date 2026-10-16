import React, { useState } from 'react';
import API from '../services/applicationService';
import './ApplyModal.css';

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState(
    job.questions ? job.questions.map((q) => ({ question: q.text, answer: '' })) : []
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await API.post('/applications/apply', {
        jobId: job._id,
        applicantPhone: phone,
        resumeUrl: resumeUrl || 'https://example.com/resume.pdf',
        coverLetter,
        answers
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="apply-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply for {job.title}</h3>
          <p className="company-subtitle">{job.company}</p>
          <button className="btn-close-x" onClick={onClose}>×</button>
        </div>

        {errorMsg && <div className="apply-error-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmitApplication} className="apply-form-steps">
          {step === 1 && (
            <div className="form-step">
              <h4>Step 1: Contact & Resume Details</h4>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Resume Link / Document URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://drive.google.com/your-resume"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
              </div>
              <button type="button" className="btn-step-next" onClick={() => setStep(2)}>
                Next: Additional Details →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h4>Step 2: Cover Letter & Screening</h4>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  rows="3"
                  placeholder="Why are you a good fit for this role?"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {answers.map((ans, idx) => (
                <div key={idx} className="form-group">
                  <label>{ans.question}</label>
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={ans.answer}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  />
                </div>
              ))}

              <div className="step-actions-row">
                <button type="button" className="btn-step-back" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn-submit-apply" disabled={loading}>
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;