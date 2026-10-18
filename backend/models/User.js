const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['candidate', 'recruiter'], default: 'candidate' },
  headline: { type: String, default: '' },
  location: { type: String, default: '' },
  about: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  education: { type: [String], default: [] },
  links: { type: [String], default: [] },
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyLocation: { type: String, default: '' },
  companyIndustry: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', mongoose.models.User || userSchema);
