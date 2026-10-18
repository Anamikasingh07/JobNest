// backend/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');

exports.applyForJob = async (req, res) => {
  try {
    const { jobId, phone, resumeUrl, coverLetter, answers } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    if (!job.employerId) {
      return res.status(400).json({ 
        message: 'This job posting is missing owner details. Please ask the recruiter to recreate the job.' 
      });
    }

    // Check duplicate application
    const existingApp = await Application.findOne({ jobId, candidateId: req.user.id });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const application = await Application.create({
      jobId,
      candidateId: req.user.id,
      employerId: job.employerId, // 👈 Explicitly binds application to posting recruiter
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      applicantPhone: phone || '',
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
      answers: answers || [],
      status: 'Applied'
    });

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
};