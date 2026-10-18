const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    salary: { type: String, required: true },
    description: { type: String, required: true },
    questions: [
      {
        text: { type: String, required: true },
        required: { type: Boolean, default: false }
      }
    ],
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);