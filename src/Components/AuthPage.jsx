import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('jobseeker'); // 'jobseeker' | 'employer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) return;

    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    let userAccount = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (isLogin) {
      if (!userAccount) {
        userAccount = {
          name: email.split('@')[0],
          email: email,
          role: role
        };
      }
    } else {
      userAccount = {
        name: name || email.split('@')[0],
        email: email,
        role: role
      };

      const updatedUsers = [...existingUsers.filter((u) => u.email !== email), userAccount];
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    }

    localStorage.setItem('currentUser', JSON.stringify(userAccount));
    localStorage.setItem('token', 'mock_jwt_token_123');

    if (userAccount.role === 'employer') {
      navigate('/admin/dashboard');
    } else {
      navigate('/tracker');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <span className="auth-brand-logo">JobNest</span>
          <h1 className="auth-title">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Enter your credentials to access your job portal'
              : 'Join JobNest to track applications or hire top talent'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-row">
          <button
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection for Sign Up & Sign In */}
          <div className="form-group">
            <label className="input-label">I am joining as a</label>
            <div className="role-selector-grid">
              <div
                className={`role-card-option ${role === 'jobseeker' ? 'selected' : ''}`}
                onClick={() => setRole('jobseeker')}
              >
                <div className="role-icon">💼</div>
                <div className="role-info">
                  <strong>Candidate</strong>
                  <span>Looking for jobs</span>
                </div>
              </div>

              <div
                className={`role-card-option ${role === 'employer' ? 'selected' : ''}`}
                onClick={() => setRole('employer')}
              >
                <div className="role-icon">🏢</div>
                <div className="role-info">
                  <strong>Recruiter</strong>
                  <span>Hiring candidates</span>
                </div>
              </div>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Anamika Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
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
              {isLogin && <button type="button" className="btn-forgot-link">Forgot?</button>}
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

          <button type="submit" className="btn-auth-submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer-text">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button type="button" className="btn-toggle-link" onClick={() => setIsLogin(false)}>
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button type="button" className="btn-toggle-link" onClick={() => setIsLogin(true)}>
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;