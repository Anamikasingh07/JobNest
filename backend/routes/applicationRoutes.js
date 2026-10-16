const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getRecruiterApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyForJob);
router.get('/recruiter/applicants', protect, recruiterOnly, getRecruiterApplicants);
router.put('/:id/status', protect, recruiterOnly, updateApplicationStatus);

module.exports = router;