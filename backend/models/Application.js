const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [
    {
      questionText: { type: String, required: true },
      answerText: { type: String, required: true }
    }
  ],
  applicantDetails: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  resumeName: { type: String, default: '' },
  resumeContentType: { type: String, default: '' },
  resumeData: { type: String, select: false },
  coverLetter: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'On Hold'],
    default: 'Applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce single application per candidate per job to prevent duplicate submissions
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
