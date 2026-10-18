import React, { useState } from 'react';
import API from '../services/applicationService';

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState(
    (job?.questions || []).reduce((acc, q) => {
      acc[q.questionText] = '';
      return acc;
    }, {})
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (questionText, value) => {
    setAnswers(prev => ({ ...prev, [questionText]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation for required employer questions
    for (const q of job?.questions || []) {
      if (q.required && (!answers[q.questionText] || answers[q.questionText].trim() === '')) {
        setError(`Please answer the required question: "${q.questionText}"`);
        return;
      }
    }

    const payloadAnswers = Object.keys(answers).map(qText => ({
      questionText: qText,
      answerText: answers[qText]
    }));

    try {
      setSubmitting(true);
      await API.post(`/applications/${job._id}`, { answers: payloadAnswers });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };
 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Apply for {job?.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{job?.companyName || 'Recruiter'}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {job?.questions && job.questions.length > 0 ? (
            job.questions.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {q.questionText} {q.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required={q.required}
                  value={answers[q.questionText] || ''}
                  onChange={(e) => handleInputChange(q.questionText, e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No additional screening questions required.</p>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
