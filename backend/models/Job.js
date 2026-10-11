const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  company: { type: String, required: true },
  location: { type: String, required: true, index: true },
  workStyle: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'On-site' },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
  salaryMin: { type: Number, index: true },
  salaryMax: { type: Number },
  currency: { type: String, default: 'INR' },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, lowercase: true, trim: true }],
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);