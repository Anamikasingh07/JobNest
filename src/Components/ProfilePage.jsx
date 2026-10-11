import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: 'Test Name',
    headline: 'Frontend Developer · React, Node.js',
    location: 'Delhi, India',
    email: 'test@email.com',
    completeness: 70,
    about: 'Frontend developer with 2 years building React apps. Looking for product-focused teams.',
    resumeName: 'Test_Name_Resume.pdf',
    resumeMeta: 'Uploaded 3 Oct · 210 KB',
    aiSkillsCount: 12,
    preferences: {
      roles: 'Frontend, Full Stack',
      location: 'Bengaluru, Remote',
      expectedSalary: '₹18L+',
      noticePeriod: 'Immediate'
    },
    visibility: {
      profileVisible: true,
      emailAlerts: true,
      showSalary: false
    },
    experience: [
      { id: '1', title: 'Frontend Intern', company: 'Acme Tech', period: 'Jun – Dec 2025' },
      { id: '2', title: 'Freelance Developer', company: 'Self-employed', period: '2024 – 2025' }
    ],
    education: [
      { id: '1', degree: 'B.Tech, Computer Science', institution: 'Delhi University', period: '2022 – 2026' }
    ],
    skills: ['React', 'Node.js', 'Tailwind', 'MongoDB', 'REST APIs'],
    links: [
      { id: '1', platform: 'GitHub', url: 'github.com/username' },
      { id: '2', platform: 'LinkedIn', url: 'linkedin.com/in/username' }
    ]
  });

  const handleToggle = (key) => {
    setProfile((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [key]: !prev.visibility[key] }
    }));
  };

  return (
    <div className="dark-profile-container">
      {/* Top Profile Summary Header Card */}
      <div className="profile-card hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar">
            {profile.name.charAt(0)}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-headline">{profile.headline}</p>
            <p className="profile-meta">
              📍 {profile.location} &nbsp;·&nbsp; ✉️ {profile.email}
            </p>
          </div>
        </div>

        <div className="profile-completeness-box">
          <div className="completeness-header">
            <span>Profile {profile.completeness}% complete</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${profile.completeness}%` }}
            ></div>
          </div>
          <p className="completeness-hint">
            Add certifications to reach 85%
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-column">
          <div className="profile-card">
            <div className="card-header-row">
              <h3>About</h3>
              <button className="btn-edit-link">Edit</button>
            </div>
            <p className="about-text">{profile.about}</p>
          </div>

          <div className="profile-card">
            <div className="card-header-row">
              <h3>Experience</h3>
              <button className="btn-add-link">+ Add</button>
            </div>
            <div className="item-list">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="list-item">
                  <div>
                    <h4 className="item-title">{exp.title}</h4>
                    <p className="item-subtitle">
                      {exp.company} · {exp.period}
                    </p>
                  </div>
                  <span className="item-chevron">›</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header-row">
              <h3>Education</h3>
              <button className="btn-add-link">+ Add</button>
            </div>
            <div className="item-list">
              {profile.education.map((edu) => (
                <div key={edu.id} className="list-item">
                  <div>
                    <h4 className="item-title">{edu.degree}</h4>
                    <p className="item-subtitle">
                      {edu.institution} · {edu.period}
                    </p>
                  </div>
                  <span className="item-chevron">›</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header-row">
              <h3>Skills</h3>
              <button className="btn-add-link">+ Add</button>
            </div>
            <div className="skills-pill-group">
              {profile.skills.map((skill, index) => (
                <span key={index} className="skill-blue-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header-row">
              <h3>Projects and links</h3>
              <button className="btn-add-link">+ Add</button>
            </div>
            <div className="item-list">
              {profile.links.map((link) => (
                <div key={link.id} className="list-item">
                  <p className="link-text">🔗 {link.url}</p>
                  <span className="item-chevron">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-column">
          <div className="profile-card">
            <h3>Resume</h3>
            <div className="resume-preview-box">
              <div className="resume-file-icon">📄</div>
              <div className="resume-file-details">
                <p className="resume-filename">{profile.resumeName}</p>
                <p className="resume-meta">{profile.resumeMeta}</p>
              </div>
            </div>

            <div className="resume-actions-row">
              <button className="btn-secondary-dark">Replace</button>
              <button className="btn-secondary-dark">Preview</button>
            </div>

            <p className="ai-detected-text">
              ✓ {profile.aiSkillsCount} skills detected by AI
            </p>
          </div>

          <div className="profile-card">
            <div className="card-header-row">
              <h3>Job preferences</h3>
              <button className="btn-edit-link">Edit</button>
            </div>
            <div className="kv-rows">
              <div className="kv-row">
                <span className="kv-key">Roles</span>
                <span className="kv-val">{profile.preferences.roles}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Location</span>
                <span className="kv-val">{profile.preferences.location}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Expected salary</span>
                <span className="kv-val">{profile.preferences.expectedSalary}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Notice period</span>
                <span className="kv-val">{profile.preferences.noticePeriod}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Visibility and alerts</h3>
            <div className="toggle-rows">
              <div className="toggle-row">
                <span>Profile visible to recruiters</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.visibility.profileVisible}
                    onChange={() => handleToggle('profileVisible')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <span>Email job alerts</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.visibility.emailAlerts}
                    onChange={() => handleToggle('emailAlerts')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-row">
                <span>Show salary to employers</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={profile.visibility.showSalary}
                    onChange={() => handleToggle('showSalary')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Account</h3>
            <div className="account-action-list">
              <button className="account-btn">
                <span>Change password</span>
                <span>›</span>
              </button>
              <button className="account-btn delete-text">
                <span>Delete account</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;