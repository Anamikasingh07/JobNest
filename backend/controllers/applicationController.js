const Application = require('../models/Application');
const Job = require('../models/Job');

// 1. Submit application with question validation and duplicate check
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { answers } = req.body;
    const candidateId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if candidate already applied
    const existingApp = await Application.findOne({ job: jobId, candidate: candidateId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Validate mandatory questions
    if (job.questions && job.questions.length > 0) {
      for (const q of job.questions) {
        if (q.required) {
          const filledAnswer = answers?.find(a => a.questionText === q.questionText);
          if (!filledAnswer || !filledAnswer.answerText || filledAnswer.answerText.trim() === '') {
            return res.status(400).json({ 
              message: `Please answer the required question: "${q.questionText}"` 
            });
          }
        }
      }
    }

    const application = new Application({
      job: jobId,
      candidate: candidateId,
      answers: answers || []
    });

    await application.save();
    return res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 2. Check if current candidate has applied to a job
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const existingApp = await Application.findOne({
      job: jobId,
      candidate: req.user._id
    });

    return res.json({ hasApplied: !!existingApp });
  } catch (err) {
    return res.status(500).json({ message: 'Error checking status', error: err.message });
  }
};

// 3. Get recruiter applications (includes candidate details and custom responses)
exports.getRecruiterApplications = async (req, res) => {
  try {
    const recruiterJobs = await Job.find({
      \$or: [
        { postedBy: req.user._id },
        { user: req.user._id },
        { recruiter: req.user._id }
      ]
    }).select('_id');

    const jobIds = recruiterJobs.map(j => j._id);

    // Fallback: If no job ownership is set up, load all applications so recruiter views aren't empty
    const query = jobIds.length > 0 ? { job: { \$in: jobIds } } : {};

    const applications = await Application.find(query)
      .populate('candidate', 'name email phone resume')
      .populate('job', 'title location companyName')
      .sort({ appliedAt: -1 });

    return res.json(applications);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// 4. Get candidate's tracker applications
exports.getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });

    return res.json(applications);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching candidate applications', error: err.message });
  }
};