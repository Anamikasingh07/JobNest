const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobseeker', 'employer'], required: true },
    
    // Recruiter Mandatory Profile Specs (Step 1)
    recruiterProfile: {
      jobTitle: { type: String, default: '' },
      companyName: { type: String, default: '' },
      website: { type: String, default: '' },
      industry: { type: String, default: '' },
      companySize: { type: String, default: '' },
      location: { type: String, default: '' },
      about: { type: String, default: '' },
      phone: { type: String, default: '' },
      isComplete: { type: Boolean, default: false }
    },

    // Candidate Wishlist / Saved Jobs (Step 9)
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);