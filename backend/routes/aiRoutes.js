const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

const router = express.Router();
router.use(protect);
router.post('/interview-prep', aiController.generateInterviewPrep);
router.post('/practice-feedback', aiController.reviewPracticeAnswer);
router.post('/resume-review', aiController.reviewResume);
router.get('/job-match/:jobId', aiController.matchCandidateToJob);

module.exports = router;
