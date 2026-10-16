import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically attach JWT authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API Calls
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);

// Job API Calls
export const fetchJobs = (params) => API.get('/jobs', { params });
export const fetchJobById = (id) => API.get(`/jobs/${id}`);
export const createJobPost = (jobData) => API.post('/jobs', jobData);

// Application API Calls
export const fetchCandidateTracker = () => API.get('/applications');
export const submitJobApplication = (payload) => API.post('/applications/apply', payload);
export const updateTrackerStage = (id, payload) => API.put(`/applications/${id}`, payload);
export const fetchRecruiterApplicants = () => API.get('/applications/recruiter');

export default API;