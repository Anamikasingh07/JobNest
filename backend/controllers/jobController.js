const Job = require('../models/Job');

// 1. Every candidate sees ALL open jobs in one list regardless of recruiter
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' })
      .populate('employerId', 'name email recruiterProfile')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// 2. Recruiter posts a job -> saved with recruiter as owner
exports.createJob = async (req, res) => {
  try {
    const newJob = await Job.create({
      title: req.body.title,
      company: req.body.company || req.user.name,
      location: req.body.location,
      workMode: req.body.workMode || 'Remote',
      type: req.body.type || 'Full-time',
      salary: req.body.salary,
      description: req.body.description,
      questions: req.body.questions || [],
      employerId: req.user.id, // Binds logged-in recruiter as owner
      status: 'Open'
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job listing', error: error.message });
  }
};

// 3. Recruiter fetches ONLY their own posted jobs
exports.getRecruiterJobs = async (req, res) => {
  try {
    const myJobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.json(myJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recruiter jobs', error: error.message });
  }
};

// 4. Update or close job listing
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized.' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};