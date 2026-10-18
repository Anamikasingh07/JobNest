import React, { useState, useEffect } from 'react';
import API from '../services/applicationService';
import './AdminApplications.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      // Calls GET /api/applications/recruiter/applicants
      const res = await API.get('/applications/recruiter/applicants');
      
      // If backend returns array directly or inside res.data.applications
      const data = Array.isArray(res.data) ? res.data : res.data.applications || [];
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading applicants...</div>;

  return (
    <div className="admin-app-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Received Applications ({applications.length})</h2>

      {applications.length === 0 ? (
        <p style={{ marginTop: '16px', color: '#6B7280' }}>
          No candidates have applied to your jobs yet. (Note: Ensure the candidate applied to a job created while logged in under this recruiter account).
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {applications.map((app) => (
            <div
              key={app._id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>
                  {app.applicantName || app.candidateId?.name || 'Applicant'}
                </h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#1D4F9F', fontWeight: '600' }}>
                  Applied for: {app.jobId?.title || 'Role'} ({app.jobId?.company})
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                  Email: {app.applicantEmail || app.candidateId?.email}
                </p>
              </div>

              <div>
                <span
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {app.status || 'Applied'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;