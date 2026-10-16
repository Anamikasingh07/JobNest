const express = require('express');
const router = express.Router();
const {
  getJobs,
  getRecruiterJobs,
  createJob,
  updateJob
} = require('../controllers/jobController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

// Public candidate view
router.get('/', getJobs);

// Recruiter specific views
router.get('/my-jobs', protect, recruiterOnly, getRecruiterJobs);
router.post('/', protect, recruiterOnly, createJob);
router.put('/:id', protect, recruiterOnly, updateJob);

module.exports = router;