const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companyName: { type: String, default: 'Company' },
  location: { type: String, required: true },
  description: { type: String, required: true },
  skills: { type: [String], default: [] },
  salary: { type: String, default: '' },
  workMode: { type: String, default: 'Remote' },
  employmentType: { type: String, default: 'Full-time' },
  experienceLevel: { type: String, enum: ['Any', 'Entry Level', 'Intermediate (1-3 yrs)', 'Senior Level'], default: 'Any' },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [
    {
      questionText: { type: String, required: true },
      required: { type: Boolean, default: false }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', mongoose.models.Job || jobSchema);
