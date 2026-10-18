const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

const protect = authMiddleware.protect || authMiddleware;

const {
  getAllJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJobStatus,
  deleteJob
} = jobController;

router.get('/', getAllJobs);
router.get('/my-jobs', protect, getMyJobs); // Must be defined BEFORE /:id
router.put('/:id/status', protect, updateJobStatus);
router.get('/:id', getJobById);
router.post('/', protect, createJob);
if (deleteJob) router.delete('/:id', protect, deleteJob);

module.exports = router;
