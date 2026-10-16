import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();

  // Mode & Role State
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [role, setRole] = useState('jobseeker'); // 'jobseeker' | 'employer'

  // Input States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear messages on user interaction
  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Switch between Candidate & Recruiter
  const handleRoleChange = (selectedRole) => {
    clearMessages();
    setRole(selectedRole);
  };

  // Switch between Sign In & Register
  const handleModeChange = (selectedMode) => {
    clearMessages();
    setMode(selectedMode);
  };

  // Handle Login & Registration Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      let response;
      if (mode === 'login') {
        // Explicit payload with normalized email & role
        response = await API.post('/auth/login', {
          email: email.trim(),
          password,
          role: role // 'jobseeker' or 'employer'
        });
      } else {
        response = await API.post('/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
          role: role
        });
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      if (user.role === 'employer') {
        navigate('/admin/dashboard');
      } else {
        navigate('/tracker');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setSuccessMsg(`Reset Code Generated: ${res.data.resetToken}`);
      setMode('reset');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error requesting reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Execution
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password', {
        email: email.trim(),
        resetToken: resetCode,
        newPassword
      });
      setSuccessMsg(res.data.message);
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <span className="auth-brand-logo">JobNest</span>
          <h1 className="auth-title">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Enter Reset Code'}
          </h1>
        </div>

        {/* Feedback Messages */}
        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}

        {/* Sign In / Register Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-tab-row">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeChange('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeChange('register')}
            >
              Register
            </button>
          </div>
        )}

        {/* Main Auth Form */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label className="input-label">I am signing in as a</label>
              <div className="role-selector-grid">
                <button
                  type="button"
                  className={`role-card-option ${role === 'jobseeker' ? 'selected' : ''}`}
                  onClick={() => handleRoleChange('jobseeker')}
                >
                  💼 Candidate
                </button>
                <button
                  type="button"
                  className={`role-card-option ${role === 'employer' ? 'selected' : ''}`}
                  onClick={() => handleRoleChange('employer')}
                >
                  🏢 Recruiter
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Anamika Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label className="input-label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="btn-forgot-link"
                    onClick={() => handleModeChange('forgot')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? `Sign In as ${role === 'employer' ? 'Recruiter' : 'Candidate'}`
                : 'Create Account'}
            </button>
          </form>
        )}

        {/* Forgot Password Flow */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            <p className="auth-subtitle">Enter your email address to receive a reset code.</p>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Generating Code...' : 'Get Reset Code'}
            </button>
            <button
              type="button"
              className="btn-toggle-link"
              onClick={() => handleModeChange('login')}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Reset Password Flow */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="auth-form">
            <div className="form-group">
              <label className="input-label">Reset Code</label>
              <input
                type="text"
                className="auth-input uppercase"
                placeholder="e.g. A1B2C3"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;