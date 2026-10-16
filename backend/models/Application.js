const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    answers: [
      {
        question: { type: String },
        answer: { type: String }
      }
    ],
    status: {
      type: String,
      enum: ['Applied', 'Reviewing', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);