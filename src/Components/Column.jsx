import React from 'react';
import './Column.css';

const Column = ({ stage, applications = [], onStatusChange }) => {
  const safeApps = Array.isArray(applications) ? applications : [];

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="header-title-group">
          <span className="column-dot"></span>
          <h3 className="column-title">{stage.title}</h3>
        </div>
        <span className="column-badge">{safeApps.length}</span>
      </div>

      <div className="column-body">
        {safeApps.length === 0 ? (
          <div className="empty-dropzone">
            <p>{stage.emptyText}</p>
          </div>
        ) : (
          safeApps.map((app) => (
            <div key={app.id} className="app-card">
              <div className="card-header-row">
                <div
                  className="company-logo"
                  style={{ backgroundColor: app.logoBg || '#374151' }}
                >
                  {app.logoLetter || app.companyName?.charAt(0)}
                </div>
                <div className="title-block">
                  <h4 className="job-role">{app.jobTitle}</h4>
                  <p className="company-title">{app.companyName}</p>
                </div>
              </div>

              <div className="card-details">
                {app.location && (
                  <p className="detail-line">
                    📍 {app.location} {app.workStyle ? `· ${app.workStyle}` : ''}
                  </p>
                )}
                {app.salary && <p className="detail-line">🏷️ {app.salary}</p>}
              </div>

              <div className="card-tags-row">
                <span className={`pill-tag source-${app.source?.toLowerCase()}`}>
                  {app.source}
                </span>
                {app.badgeText && (
                  <span className={`pill-tag badge-${app.badgeType || 'default'}`}>
                    {app.badgeText}
                  </span>
                )}
              </div>

              <div className="card-footer">
                <span className="applied-ago">
                  🕒 Applied {app.appliedDaysAgo} days ago
                </span>
                <span className="status-dropdown" aria-label={`Application status: ${app.status}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
