import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/applicationService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState({ activeJobs: 0, totalApplications: 0, interviews: 0, offers: 0 });
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, jobsResponse] = await Promise.all([
        API.get('/applications/recruiter'),
        API.get('/jobs/my-jobs')
      ]);

      const appList = Array.isArray(applicationsResponse.data)
        ? applicationsResponse.data
        : applicationsResponse.data.applications || [];
      setApplications(appList);

      const activeCount = appList.length;
      const interviewCount = appList.filter(a => a.status === 'Interview').length;
      const offerCount = appList.filter(a => a.status === 'Offer' || a.status === 'Hired').length;

      setMetrics({
        activeJobs: Array.isArray(jobsResponse.data) ? jobsResponse.data.filter((job) => job.status !== 'Closed').length : 0,
        totalApplications: activeCount,
        interviews: interviewCount,
        offers: offerCount
      });
    } catch (err) {
      console.error('Error loading recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <div style={{ padding: '24px' }}>Loading live candidate submissions...</div>;

  return (
    <div className="recruiter-dashboard" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      <h2>Recruiter Control Center</h2>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>
        Monitor posted jobs and review incoming candidate applications.
      </p>

      {/* Dynamic Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Active Job Posts</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{metrics.activeJobs}</h3>
        </div>
        <div style={{ background: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Total Applications</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{metrics.totalApplications}</h3>
        </div>
        <div style={{ background: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Interviews Scheduled</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{metrics.interviews}</h3>
        </div>
        <div style={{ background: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Offers Extended</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px' }}>{metrics.offers}</h3>
        </div>
      </div>

      {/* Live Candidate Submissions Table */}
      <h3>Recent Candidate Submissions ({applications.length})</h3>
      <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginTop: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>APPLICANT NAME</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>APPLIED ROLE</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>DATE</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>CURRENT STAGE</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                  No candidate submissions received yet for your posted jobs.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <strong>{app.candidate?.name || 'Candidate'}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {app.candidate?.email || 'Email unavailable'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{app.job?.title || 'Job'}</td>
                  <td style={{ padding: '14px 16px' }}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {app.status || 'Applied'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => navigate(`/admin/applications?applicationId=${encodeURIComponent(app._id)}`)}
                      style={{ padding: '6px 12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Review Candidate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Candidate Submission Modal */}
      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#FFF', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedApp.candidate?.name || 'Candidate'}</h3>
                <p style={{ margin: '4px 0 0 0', color: '#1D4F9F', fontSize: '13px', fontWeight: 'bold' }}>
                  Applied for: {selectedApp.job?.title || 'Job'}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <p><strong>Email:</strong> {selectedApp.candidate?.email || 'Email unavailable'}</p>

            {/* Screening Answers Display */}
            {selectedApp.answers && selectedApp.answers.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Screening Questions & Answers:</h4>
                {selectedApp.answers.map((ans, idx) => (
                  <div key={idx} style={{ background: '#F3F4F6', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>Q: {ans.questionText}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1D4F9F' }}>A: {ans.answerText || 'No answer provided'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
