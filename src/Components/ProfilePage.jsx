import React, { useEffect, useState } from 'react';
import API from '../services/applicationService';
import { getProfileCompletion } from '../utils/profileCompletion';
import './ProfilePage.css';

const emptyProfile = {
  name: '', email: '', phone: '', headline: '', location: '', about: '', skills: [], experience: [], education: [], links: [],
  companyName: '', companyWebsite: '', companyLocation: '', companyIndustry: '', companyDescription: ''
};

const getSignedInUser = () => {
  try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); }
  catch { return {}; }
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(() => ({ ...emptyProfile, ...getSignedInUser() }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [resumeFileError, setResumeFileError] = useState('');
  const isRecruiter = (profile.role || getSignedInUser().role) === 'recruiter';
  const profileCompletion = getProfileCompletion(profile, isRecruiter ? 'recruiter' : 'candidate');

  useEffect(() => {
    API.get('/auth/profile')
      .then(({ data }) => setProfile({ ...emptyProfile, ...data }))
      .catch((error) => setMessage(error.response?.data?.message || error.response?.data?.error || 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  const handleResumeSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!validExtension) {
      setResumeFileError('Upload a PDF, DOC, or DOCX file.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeFileError('Resume must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(new Error('Could not read this file. Please try again.'));
        reader.readAsDataURL(file);
      });
      setProfile((current) => ({ ...current, resumeName: file.name, resumeContentType: file.type, resumeData: data }));
      setResumeFileError('');
      setMessage('Resume selected. Save your profile to keep it.');
    } catch (error) {
      setResumeFileError(error.message);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = isRecruiter
        ? {
            name: profile.name,
            phone: profile.phone,
            companyName: profile.companyName,
            companyWebsite: profile.companyWebsite,
            companyLocation: profile.companyLocation,
            companyIndustry: profile.companyIndustry,
            companyDescription: profile.companyDescription
          }
        : {
            name: profile.name,
            phone: profile.phone,
            headline: profile.headline,
            location: profile.location,
            about: profile.about,
            skills: (profile.skillsText ?? (profile.skills || []).join(', ')).split(',').map((skill) => skill.trim()).filter(Boolean),
            experience: (profile.experienceText ?? (profile.experience || []).join('\n')).split('\n').map((item) => item.trim()).filter(Boolean),
            education: (profile.educationText ?? (profile.education || []).join('\n')).split('\n').map((item) => item.trim()).filter(Boolean),
            links: (profile.linksText ?? (profile.links || []).join('\n')).split('\n').map((item) => item.trim()).filter(Boolean)
          };
      if (!isRecruiter && profile.resumeData) {
        payload.resumeName = profile.resumeName;
        payload.resumeContentType = profile.resumeContentType;
        payload.resumeData = profile.resumeData;
      }
      const { data } = await API.put('/auth/profile', payload);
      setProfile({ ...emptyProfile, ...data.user });
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: data.user.name }));
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="dark-profile-container"><div className="profile-card">Loading profile...</div></div>;

  return (
    <div className="dark-profile-container">
      <header className="profile-card hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar">{(profile.name || 'U').charAt(0).toUpperCase()}</div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{profile.name || 'Your profile'}</h1>
            <p className="profile-headline">{isRecruiter ? (profile.companyName || 'Recruiter profile') : (profile.headline || 'Add a professional headline')}</p>
            <p className="profile-meta">{profile.email}</p>
          </div>
        </div>
      </header>

      {!profileCompletion.complete && (
        <div className="profile-completion-notice" role="status">
          <strong>Profile completion: {isRecruiter ? 'Recruiter' : 'Candidate'}</strong>
          <p>Complete these fields to {isRecruiter ? 'create job postings' : 'apply for jobs'}: {profileCompletion.missing.join(', ')}.</p>
        </div>
      )}

      <form className="profile-card profile-edit-form" onSubmit={saveProfile}>
        {message && <p className="profile-save-message" role="status">{message}</p>}
        <div className="profile-form-grid">
          <label>Full name<input value={profile.name || ''} onChange={(event) => updateField('name', event.target.value)} required /></label>
          <label>Email<input value={profile.email || ''} readOnly /></label>
          <label>Phone<input value={profile.phone || ''} onChange={(event) => updateField('phone', event.target.value)} required /></label>

          {isRecruiter ? (
            <>
              <h2 className="profile-form-section-title">Company details</h2>
              <label>Company name<input value={profile.companyName || ''} onChange={(event) => updateField('companyName', event.target.value)} placeholder="Your company" required /></label>
              <label>Company website<input value={profile.companyWebsite || ''} onChange={(event) => updateField('companyWebsite', event.target.value)} placeholder="https://example.com" required /></label>
              <label>Company location<input value={profile.companyLocation || ''} onChange={(event) => updateField('companyLocation', event.target.value)} required /></label>
              <label>Industry<input value={profile.companyIndustry || ''} onChange={(event) => updateField('companyIndustry', event.target.value)} required /></label>
              <label className="profile-form-wide">About the company<textarea rows="5" value={profile.companyDescription || ''} onChange={(event) => updateField('companyDescription', event.target.value)} required /></label>
            </>
          ) : (
            <>
              <h2 className="profile-form-section-title">Candidate profile</h2>
              <label>Professional headline<input value={profile.headline || ''} onChange={(event) => updateField('headline', event.target.value)} placeholder="e.g. Frontend Developer" required /></label>
              <label>Location<input value={profile.location || ''} onChange={(event) => updateField('location', event.target.value)} required /></label>
              <label className="profile-form-wide">Skills <small>Separate skills with commas. These are used to compare your profile with job requirements.</small><input value={profile.skillsText ?? (profile.skills || []).join(', ')} onChange={(event) => updateField('skillsText', event.target.value)} placeholder="React, JavaScript, Node.js" required /></label>
              <label className="profile-form-wide">About<textarea rows="4" value={profile.about || ''} onChange={(event) => updateField('about', event.target.value)} required /></label>
              <label className="profile-form-wide">Experience <small>One entry per line.</small><textarea rows="3" value={profile.experienceText ?? (profile.experience || []).join('\n')} onChange={(event) => updateField('experienceText', event.target.value)} required /></label>
              <label className="profile-form-wide">Education <small>One entry per line.</small><textarea rows="3" value={profile.educationText ?? (profile.education || []).join('\n')} onChange={(event) => updateField('educationText', event.target.value)} required /></label>
              <label className="profile-form-wide">Resume <small>PDF, DOC, or DOCX. Maximum file size: 5 MB.</small><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeSelection} required={!profile.hasResume && !profile.resumeData} /><span className="profile-resume-name">{profile.resumeName ? `Selected: ${profile.resumeName}` : 'A resume is required to apply for jobs.'}</span>{resumeFileError && <span className="profile-resume-error" role="alert">{resumeFileError}</span>}</label>
              <label className="profile-form-wide">Links <small>One URL per line.</small><textarea rows="2" value={profile.linksText ?? (profile.links || []).join('\n')} onChange={(event) => updateField('linksText', event.target.value)} /></label>
            </>
          )}
        </div>
        <button className="profile-save-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
};

export default ProfilePage;
