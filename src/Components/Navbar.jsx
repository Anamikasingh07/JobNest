import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/applicationService';
import './Navbar.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('jobnest_theme') || 'light');
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isRecruiter = ['recruiter', 'employer'].includes((currentUser?.role || '').toLowerCase());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jobnest_theme', theme);
  }, [theme]);

  // Load session state on route changes
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      setCurrentUser(null);
    }
  }, [location]);

  useEffect(() => {
    if (!currentUser || isRecruiter) {
      setNotifications([]);
      return undefined;
    }
    const loadNotifications = () => API.get('/notifications')
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(timer);
  }, [currentUser, isRecruiter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleNavigateProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Clear session storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();

    // 2. Reset local state
    setCurrentUser(null);
    setDropdownOpen(false);

    // 3. Redirect to login page
    navigate('/auth');
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      try {
        const { data } = await API.patch(`/notifications/${notification._id}/read`);
        setNotifications((current) => current.map((item) => item._id === data._id ? data : item));
      } catch (error) {
        console.error('Could not mark notification as read:', error);
      }
    }
    setNotificationsOpen(false);
    navigate('/tracker');
  };

  return (
    <header className="top-navbar">
      <div className="nav-brand">
        <NavLink
          to={isRecruiter ? '/admin/dashboard' : '/tracker'}
          className="brand-logo"
        >
          JobNest
        </NavLink>
      </div>

      <nav className="nav-links">
        {isRecruiter ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/manage"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Manage jobs
            </NavLink>
            <NavLink
              to="/admin/applications"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Applicants
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/tracker"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Application tracker
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              Find jobs
            </NavLink>
            <NavLink
              to="/ai-assistant"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              AI assistant
            </NavLink>
          </>
        )}
      </nav>

      <div className="nav-actions">
        <button
          className="btn-icon-square"
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>

        {!isRecruiter && (
          <div className="notification-wrapper">
            <button className="btn-icon-square notification-bell" type="button" title="Notifications" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {notifications.some((notification) => !notification.readAt) && <span className="notification-unread-dot" />}
            </button>
            {notificationsOpen && (
              <div className="notifications-menu">
                <div className="notifications-menu-header">Notifications</div>
                {notifications.length ? notifications.map((notification) => (
                  <button type="button" key={notification._id} className={`notification-item ${notification.readAt ? '' : 'unread'}`} onClick={() => openNotification(notification)}>
                    <span>{notification.message}</span>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </button>
                )) : <p className="notifications-empty">No application updates yet.</p>}
              </div>
            )}
          </div>
        )}

        <div className="profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="user-badge-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="avatar-circle">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="user-meta">
              <span className="user-name">{currentUser?.name || 'Name'}</span>
              <span className="user-role-label">
                {isRecruiter ? 'Recruiter' : 'Candidate'}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <p className="dropdown-user-name">{currentUser?.name || 'User'}</p>
                <p className="dropdown-user-email">{currentUser?.email || 'user@example.com'}</p>
              </div>

              <hr className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onMouseDown={handleNavigateProfile}
                onClick={handleNavigateProfile}
              >
                👤 View Profile
              </button>

              <button
                type="button"
                className="dropdown-item logout-item"
                onMouseDown={handleLogout}
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
