import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      setCurrentUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setDropdownOpen(false);

    navigate('/auth');
  };

  return (
    <header className="top-navbar">
      <div className="nav-left">
        <NavLink
          to={currentUser?.role === 'employer' ? '/admin/dashboard' : '/tracker'}
          className="brand-logo"
        >
          JobNest<span className="logo-dot">.</span>
        </NavLink>

        {/* Dynamic Navigation matching account role */}
        <nav className="nav-links">
          {currentUser?.role === 'employer' ? (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                📈 Recruiter Dashboard
              </NavLink>
              <NavLink
                to="/admin/manage"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                📊 Manage Job Listings
              </NavLink>
              <NavLink
                to="/admin/applications"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                👥 Applicants
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/tracker"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                📋 Application Tracker
              </NavLink>
              <NavLink
                to="/jobs"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                💼 Find Jobs
              </NavLink>
              <NavLink
                to="/ai-assistant"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                🤖 AI Match Assistant
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div className="nav-right">
        <button className="nav-icon-btn" type="button" title="Notifications">
          🔔
        </button>

        {currentUser ? (
          <div className="profile-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className="user-profile-badge-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="avatar-circle">
                {currentUser.role === 'employer' ? 'R' : 'C'}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">
                  {currentUser.role === 'employer' ? 'Recruiter' : 'Candidate'} ▾
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-user-header">
                  <p className="dropdown-user-name">{currentUser.name}</p>
                  <p className="dropdown-user-email">{currentUser.email}</p>
                  <span className="dropdown-role-badge">
                    Role: {currentUser.role === 'employer' ? 'Recruiter' : 'Candidate'}
                  </span>
                </div>

                <hr className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                >
                  👤 View Profile
                </button>

                <button
                  type="button"
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary-blue-sm"
            onClick={() => navigate('/auth')}
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;