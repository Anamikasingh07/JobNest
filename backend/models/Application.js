const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 👈 Mandatory
    applicantName: { type: String },
    applicantEmail: { type: String },
    applicantPhone: { type: String },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    answers: Array,
    status: { type: String, default: 'Applied' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);