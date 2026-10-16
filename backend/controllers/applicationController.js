const Application = require('../models/Application');
const Job = require('../models/Job');

// GET /api/applications/recruiter/applicants -> Get live submissions for recruiter
exports.getRecruiterApplicants = async (req, res) => {
  try {
    const applications = await Application.find({ employerId: req.user.id })
      .populate('jobId', 'title company location salary')
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// PUT /api/applications/:id/status -> Change applicant pipeline stage
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, employerId: req.user.id },
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized.' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};