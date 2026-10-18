import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchCandidateApps = async () => {
      try {
        const res = await axios.get('/api/applications/candidate', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching tracker applications:', err);
      }
    };
    fetchCandidateApps();
  }, []);

  const stages = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

  return (
    <div className="p-6 grid grid-cols-5 gap-4">
      {stages.map(stage => {
        const stageApps = applications.filter(app => app.status === stage);
        return (
          <div key={stage} className="bg-gray-100 p-3 rounded-lg min-h-[400px]">
            <h3 className="font-bold text-sm mb-3 text-gray-700">{stage} ({stageApps.length})</h3>
            <div className="space-y-3">
              {stageApps.map(app => (
                <div key={app._id} className="bg-white p-3 rounded border shadow-sm">
                  <h4 className="font-bold text-sm">{app.job?.title || 'Job Title'}</h4>
                  <p className="text-xs text-gray-500">{app.job?.companyName || 'Company'}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationTracker;