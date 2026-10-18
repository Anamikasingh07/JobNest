import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('/api/applications/recruiter', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Error loading applications:', err);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Received Applications ({applications.length})</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Candidate</th>
              <th className="p-3">Applied Job</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app._id} className="border-b">
                <td className="p-3 font-medium">{app.candidate?.name || 'N/A'}</td>
                <td className="p-3">{app.job?.title || 'N/A'}</td>
                <td className="p-3">{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200"
                  >
                    Review Candidate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold">{selectedApp.candidate?.name}'s Application</h3>
            <p className="text-sm text-gray-600">Email: {selectedApp.candidate?.email}</p>

            <div>
              <h4 className="font-semibold text-sm mb-2">Submitted Answers:</h4>
              {selectedApp.answers && selectedApp.answers.length > 0 ? (
                selectedApp.answers.map((ans, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 border rounded mb-2 text-sm">
                    <p className="font-semibold text-gray-700">{ans.questionText}</p>
                    <p className="text-gray-900">{ans.answerText}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No custom screening questions answered.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedApp(null)}
              className="w-full py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicants;