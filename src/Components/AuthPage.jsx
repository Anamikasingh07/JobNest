import React, { useState } from 'react';
import axios from 'axios';
import './AuthPage.css';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeMode = (nextMode) => {
    setIsSignIn(nextMode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = isSignIn ? 'login' : 'register';
      const payload = isSignIn
        ? { email: email.trim(), password, role }
        : { name: name.trim(), email: email.trim(), password, role };
      const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);
      const user = response.data.user;
      const userRole = (user.role || 'candidate').toLowerCase();

      localStorage.setItem('token', response.data.token);
      // Keep both keys for compatibility with existing application components.
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));

      window.location.assign(userRole === 'recruiter' ? '/admin/dashboard' : '/tracker');
    } catch (requestError) {
      const responseData = requestError.response?.data;
      setError(
        responseData?.message ||
          requestError.message ||
          `Unable to ${isSignIn ? 'sign in' : 'register'}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-brand-mark" aria-hidden="true">J</span>
          <span>JobNest</span>
        </div>

        <div className="auth-heading">
          <p className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h1 id="auth-title">{isSignIn ? 'Welcome back' : 'Create your account'}</h1>
          <p>{isSignIn ? 'Sign in to continue to your JobNest workspace.' : 'Choose your account type to get started.'}</p>
        </div>

        <div className="auth-mode-switch" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={isSignIn} className={isSignIn ? 'active' : ''} onClick={() => changeMode(true)}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={!isSignIn} className={!isSignIn ? 'active' : ''} onClick={() => changeMode(false)}>
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset className="auth-role-picker">
            <legend>{isSignIn ? 'Sign in as' : 'Create account as'}</legend>
            <div className="auth-role-options">
              <button type="button" aria-pressed={role === 'candidate'} className={role === 'candidate' ? 'selected' : ''} onClick={() => { setRole('candidate'); setError(''); }}>
                <span className="auth-role-icon" aria-hidden="true">↗</span>
                <span><strong>Candidate</strong><small>Track your applications</small></span>
                <span className="auth-role-radio" aria-hidden="true" />
              </button>
              <button type="button" aria-pressed={role === 'recruiter'} className={role === 'recruiter' ? 'selected' : ''} onClick={() => { setRole('recruiter'); setError(''); }}>
                <span className="auth-role-icon recruiter" aria-hidden="true">▤</span>
                <span><strong>Recruiter</strong><small>Manage jobs and applicants</small></span>
                <span className="auth-role-radio" aria-hidden="true" />
              </button>
            </div>
          </fieldset>

          {!isSignIn && (
            <label className="auth-field">
              <span>Full name</span>
              <input type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}

          <label className="auth-field">
            <span>Email address</span>
            <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input type="password" autoComplete={isSignIn ? 'current-password' : 'new-password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isSignIn ? `Sign in as ${role}` : `Create ${role} account`}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="auth-footer">By continuing, you agree to use JobNest responsibly.</p>
      </section>
      <aside className="auth-promo" aria-label="JobNest features">
        <div className="auth-promo-content">
          <span className="auth-promo-tag">A clearer path to what’s next</span>
          <h2>Make your next move count.</h2>
          <p>Keep every opportunity organized and every hiring conversation moving forward.</p>
          <div className="auth-promo-card">
            <span className="promo-card-icon">✦</span>
            <div><strong>One workspace. More momentum.</strong><small>Applications, jobs, and people in one place.</small></div>
          </div>
        </div>
        <span className="auth-promo-orbit orbit-one" />
        <span className="auth-promo-orbit orbit-two" />
      </aside>
    </main>
  );
};

export default AuthPage;
