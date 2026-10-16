const Job = require('../models/Job');
const User = require('../models/User');

// GET /api/jobs -> Candidates see ALL open job listings
exports.getJobs = async (req, res) => {
  try {
    const { title, location, experience, workMode, type } = req.query;
    let filter = { status: 'Open' };

    if (title) filter.title = { $regex: title, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (experience && experience !== 'All') filter.experience = experience;
    if (workMode && workMode !== 'All') filter.workMode = workMode;
    if (type && type !== 'All') filter.type = type;

    const jobs = await Job.find(filter)
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// GET /api/jobs/my-jobs -> Recruiters see ONLY jobs posted by their account
exports.getRecruiterJobs = async (req, res) => {
  try {
    const myJobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    res.json(myJobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recruiter jobs', error: error.message });
  }
};

// POST /api/jobs -> Recruiter posts a job
exports.createJob = async (req, res) => {
  try {
    const recruiter = await User.findById(req.user.id);
    
    // Automatically bind company name to recruiter profile
    const companyName = recruiter?.company || recruiter?.name || 'Recruiter Company';

    const newJob = await Job.create({
      title: req.body.title,
      company: companyName,
      location: req.body.location,
      workMode: req.body.workMode || 'Remote',
      type: req.body.type || 'Full-time',
      salary: req.body.salary,
      description: req.body.description,
      employerId: req.user.id,
      status: 'Open'
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error('SERVER JOB CREATION ERROR:', error); // Prints exact error in VS Code terminal
    res.status(500).json({ 
      message: error.message || 'Error creating job listing',
      details: error.errors || null 
    });
  }
};

// PUT /api/jobs/:id -> Recruiter updates or closes their job
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