const express = require('express');
const router = express.Router();
const {
  applyForJob,
  checkApplicationStatus,
  getRecruiterApplications,
  getRecruiterApplicationDetails,
  updateRecruiterApplicationStatus,
  getCandidateApplications
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, applyForJob);
router.get('/status/:jobId', protect, checkApplicationStatus);
router.patch('/recruiter/:applicationId/status', protect, updateRecruiterApplicationStatus);
router.get('/recruiter/:applicationId', protect, getRecruiterApplicationDetails);
router.get('/recruiter', protect, getRecruiterApplications);
router.get('/candidate', protect, getCandidateApplications);

module.exports = router;
