const express = require('express');
const router = express.Router();
const { 
  applyForJob, 
  checkApplicationStatus, 
  getRecruiterApplications,
  getCandidateApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Candidate Routes
router.post('/apply/:jobId', protect, authorize('candidate'), applyForJob);
router.get('/check-status/:jobId', protect, authorize('candidate'), checkApplicationStatus);
router.get('/candidate', protect, authorize('candidate'), getCandidateApplications);

// Recruiter Routes
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplications);

module.exports = router;