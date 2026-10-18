const Notification = require('../models/Notification');

exports.getCandidateNotifications = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'candidate') {
      return res.status(403).json({ message: 'Notifications are available to candidate accounts.' });
    }
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate({ path: 'application', select: 'job status', populate: { path: 'job', select: 'title companyName' } })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(notifications);
  } catch (err) {
    return res.status(500).json({ message: 'Could not load notifications.', error: err.message });
  }
};

exports.markCandidateNotificationRead = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'candidate') {
      return res.status(403).json({ message: 'Notifications are available to candidate accounts.' });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    return res.json(notification);
  } catch (err) {
    return res.status(500).json({ message: 'Could not update notification.', error: err.message });
  }
};
