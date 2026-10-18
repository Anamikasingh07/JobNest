const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// 1. Get all jobs for candidate search/listing
exports.getAllJobs = async (req, res) => {
  try {
    // Public listings must belong to an account; legacy orphaned records are
    // not active recruiter postings and should not appear to candidates.
    const filters = [
      { status: { $ne: 'Closed' } },
      { $or: [
        { postedBy: { $exists: true, $ne: null } },
        { recruiter: { $exists: true, $ne: null } },
        { user: { $exists: true, $ne: null } }
      ] }
    ];

    const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (req.query.title?.trim()) {
      const keyword = new RegExp(escapeRegex(req.query.title.trim()), 'i');
      const matchingRecruiters = await User.find({ $or: [{ companyName: keyword }, { name: keyword }] }).select('_id');
      const keywordMatches = [{ title: keyword }, { companyName: keyword }];
      if (matchingRecruiters.length) {
        const recruiterIds = matchingRecruiters.map((recruiter) => recruiter._id);
        keywordMatches.push({ postedBy: { $in: recruiterIds } }, { recruiter: { $in: recruiterIds } });
      }
      filters.push({ $or: keywordMatches });
    }
    if (req.query.location?.trim()) {
      filters.push({ location: new RegExp(escapeRegex(req.query.location.trim()), 'i') });
    }
    if (req.query.workMode && req.query.workMode !== 'All') {
      filters.push({ workMode: new RegExp(`^${escapeRegex(req.query.workMode)}$`, 'i') });
    }
    if (req.query.type && req.query.type !== 'All') {
      filters.push({ employmentType: new RegExp(`^${escapeRegex(req.query.type)}$`, 'i') });
    }
    if (req.query.experience && req.query.experience !== 'All') {
      filters.push({ $or: [
        { experienceLevel: req.query.experience },
        { experienceLevel: 'Any' },
        { experienceLevel: { $exists: false } }
      ] });
    }

    const jobs = await Job.find({ $and: filters })
      .populate('postedBy', 'companyName name')
      .populate('recruiter', 'companyName name')
      .sort({ createdAt: -1 });
    const candidateJobs = jobs.map((job) => {
      const result = job.toObject();
      const recruiter = result.postedBy || result.recruiter;
      const savedCompany = String(result.companyName || '').trim();
      const companyIsFallback = !savedCompany || savedCompany.toLowerCase() === 'company' || savedCompany === recruiter?.name;
      if (companyIsFallback && recruiter?.companyName) result.companyName = recruiter.companyName;
      else if (!savedCompany && recruiter?.name) result.companyName = recruiter.name;
      else if (!savedCompany) result.companyName = 'Company name not provided';
      return result;
    });
    return res.json(candidateJobs);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
};

// 2. Get jobs created by logged-in recruiter
exports.getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const jobs = await Job.find({
      $or: [
        { postedBy: recruiterId },
        { recruiter: recruiterId },
        { user: recruiterId }
      ]
    }).sort({ createdAt: -1 });

    return res.json(jobs);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching recruiter jobs', error: err.message });
  }
};

// 3. Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status === 'Closed') {
      return res.status(404).json({ message: 'This job posting is closed.' });
    }
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching job', error: err.message });
  }
};

// 4. Create new job posting
exports.createJob = async (req, res) => {
  try {
    if (!['recruiter', 'employer'].includes((req.user?.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiter accounts can post jobs.' });
    }

    const {
      title,
      companyName,
      location,
      description,
      skills,
      experienceLevel,
      salary,
      workMode,
      employmentType,
      type,
      questions
    } = req.body;

    if (!title || !location || !description) {
      return res.status(400).json({ message: 'Title, location, and description are required.' });
    }

    const newJob = new Job({
      title,
      companyName: companyName || req.user?.companyName || req.user?.name || 'Company',
      location,
      description,
      skills: Array.isArray(skills) ? skills.map((skill) => String(skill).trim()).filter(Boolean) : String(skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
      salary: salary || '',
      workMode: workMode || 'Remote',
      employmentType: employmentType || type || 'Full-time',
      experienceLevel: experienceLevel || 'Any',
      status: 'Open',
      postedBy: req.user?._id,
      recruiter: req.user?._id,
      questions: questions || []
    });

    await newJob.save();
    return res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (err) {
    console.error('Job Creation Error:', err);
    return res.status(500).json({ message: 'Error creating job', error: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    if (!['recruiter', 'employer'].includes((req.user?.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiters can change job posting status.' });
    }

    const { status } = req.body;
    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Open or Closed.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const recruiterId = String(req.user._id);
    const ownsJob = [job.postedBy, job.recruiter, job.user]
      .some((ownerId) => ownerId && String(ownerId) === recruiterId);
    if (!ownsJob) {
      return res.status(403).json({ message: 'You can only update your own job postings.' });
    }

    job.status = status;
    await job.save();
    return res.json({ message: status === 'Closed' ? 'Job posting closed.' : 'Job posting republished.', job });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating job posting', error: err.message });
  }
};

// 5. Delete job posting
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!['recruiter', 'employer'].includes((req.user?.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiters can delete job postings.' });
    }

    const recruiterId = String(req.user._id);
    const ownsJob = [job.postedBy, job.recruiter, job.user]
      .some((ownerId) => ownerId && String(ownerId) === recruiterId);
    if (!ownsJob) {
      return res.status(403).json({ message: 'You can only delete your own job postings.' });
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    return res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting job', error: err.message });
  }
};
