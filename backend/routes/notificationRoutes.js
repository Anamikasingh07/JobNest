const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCandidateNotifications, markCandidateNotificationRead } = require('../controllers/notificationController');

router.get('/', protect, getCandidateNotifications);
router.patch('/:id/read', protect, markCandidateNotificationRead);

module.exports = router;
