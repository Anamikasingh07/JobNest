const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
