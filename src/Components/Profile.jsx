// Add this role-check block inside src/Components/ProfilePage.jsx
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

if (currentUser.role === 'employer') {
  return (
    <div className="dark-profile-container">
      <div className="profile-card hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar recruiter-bg">R</div>
          <div className="profile-hero-info">
            <h1 className="profile-name">Recruiter Control Center</h1>
            <p className="profile-headline">Talent Acquisition Manager · JobNest Hiring</p>
            <p className="profile-meta">📍 Bengaluru, India · ✉️ recruiter@jobnest.com</p>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-column">
          <div className="profile-card">
            <h3>Company Information</h3>
            <p className="about-text">
              JobNest Technology Solutions — Building next-generation hiring systems and developer tools.
            </p>
          </div>

          <div className="profile-card">
            <h3>Active Postings Overview</h3>
            <div className="kv-rows">
              <div className="kv-row">
                <span className="kv-key">Open Positions</span>
                <span className="kv-val">2 Active Listings</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Total Applicants Received</span>
                <span className="kv-val">70 Candidates</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-column">
          <div className="profile-card">
            <h3>Account & Access Controls</h3>
            <div className="account-action-list">
              <button className="account-btn">Change password ›</button>
              <button className="account-btn delete-text">Delete recruiter account ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}