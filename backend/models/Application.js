const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: false },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  status: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  source: { type: String, enum: ['Internal', 'External'], default: 'Internal' },
  coverNote: { type: String },
  resumeUrl: { type: String },
  notes: { type: String },
  recruiterContact: { name: String, email: String, phone: String },
  interviewDate: { type: Date },
  followUpReminder: { type: Date },
  stageHistory: [stageHistorySchema]
}, { timestamps: true });

applicationSchema.index({ user: 1, job: 1 }, { unique: true, partialFilterExpression: { job: { $exists: true } } });

module.exports = mongoose.model('Application', applicationSchema);