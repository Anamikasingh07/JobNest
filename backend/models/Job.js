const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, default: 'Recruiter Company' },
    location: { type: String, required: true },
    workMode: { type: String, enum: ['Hybrid', 'On-site', 'Remote'], default: 'Remote' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);