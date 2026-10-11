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

    // Check if user account already exists in mock/local database
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    let userAccount = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (isLogin) {
      if (!userAccount) {
        // Fallback for new email login
        userAccount = {
          name: email.split('@')[0],
          email: email,
          role: role
        };
      }
    } else {
      // Register logic: lock email to selected role permanently
      userAccount = {
        name: name || email.split('@')[0],
        email: email,
        role: role
      };

      const updatedUsers = [...existingUsers.filter((u) => u.email !== email), userAccount];
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    }

    // Save active session
    localStorage.setItem('currentUser', JSON.stringify(userAccount));
    localStorage.setItem('token', 'mock_jwt_token_123');

    // Route based on registered role
    if (userAccount.role === 'employer') {
      navigate('/admin/manage');
    } else {
      navigate('/tracker');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-box">
        <h2>{isLogin ? 'Sign In to JobNest' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? 'Enter your credentials to access your portal'
            : 'Register to find jobs or hire top candidates'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Anamika Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-form-group">
              <label>Register As</label>
              <div className="role-radio-group">
                <label className={`radio-tile ${role === 'jobseeker' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="jobseeker"
                    checked={role === 'jobseeker'}
                    onChange={() => setRole('jobseeker')}
                  />
                  <span>Candidate (Job Seeker)</span>
                </label>
                <label className={`radio-tile ${role === 'employer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === 'employer'}
                    onChange={() => setRole('employer')}
                  />
                  <span>Recruiter (Employer)</span>
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="btn-auth-submit">
            {isLogin ? 'Log In' : 'Register Account'}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button type="button" className="btn-link" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button type="button" className="btn-link" onClick={() => setIsLogin(true)}>
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;