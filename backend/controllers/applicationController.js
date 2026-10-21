const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { getMissingProfileFields } = require('../utils/profileCompletion');

// 1. Submit Application
const applyForJob = async (req, res) => {
  let jobId;
  let candidateId;
  try {
    if ((req.user.role || '').toLowerCase() !== 'candidate') {
      return res.status(403).json({ message: 'Only candidate accounts can apply for jobs.' });
    }

    const candidateProfile = await User.findById(req.user._id).select('-password +resumeData');
    const missingProfileFields = getMissingProfileFields(candidateProfile, 'candidate');
    if (missingProfileFields.length) {
      return res.status(400).json({
        message: 'Complete your candidate profile before applying for a job.',
        missingFields: missingProfileFields
      });
    }

    jobId = req.params.jobId;
    const { answers, applicantDetails, resume, coverLetter } = req.body;
    candidateId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status === 'Closed') {
      return res.status(400).json({ message: 'This job posting is closed and is no longer accepting applications.' });
    }

    const existingApp = await Application.findOne({ job: jobId, candidate: candidateId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const application = new Application({
      job: jobId,
      candidate: candidateId,
      answers: answers || [],
      applicantDetails: {
        fullName: applicantDetails?.fullName?.trim() || req.user.name || '',
        email: applicantDetails?.email?.trim() || '',
        phone: applicantDetails?.phone?.trim() || '',
        location: applicantDetails?.location?.trim() || ''
      },
      resumeName: resume?.name || '',
      resumeContentType: resume?.contentType || '',
      resumeData: resume?.data || undefined,
      coverLetter: coverLetter || ''
    });

    await application.save();
    const savedApplication = application.toObject();
    delete savedApplication.resumeData;
    return res.status(201).json({ message: 'Application submitted successfully!', application: savedApplication });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateApplication = await Application.exists({ job: jobId, candidate: candidateId });
      if (duplicateApplication) {
        return res.status(409).json({ message: 'You have already applied for this job.' });
      }
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 2. Check Candidate Application Status
const checkApplicationStatus = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'candidate') {
      return res.status(403).json({ message: 'Only candidate accounts can view their application status.' });
    }

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

// 3. Get Recruiter Applications (Matches Recruiter Posted Jobs)
const getRecruiterApplications = async (req, res) => {
  try {
    if (!['recruiter', 'employer'].includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiter accounts can view received applications.' });
    }

    const recruiterId = req.user._id;

    const recruiterJobs = await Job.find({
      $or: [
        { postedBy: recruiterId },
        { recruiter: recruiterId },
        { user: recruiterId }
      ]
    }).select('_id');

    const jobIds = recruiterJobs.map((job) => job._id);
    if (jobIds.length === 0) {
      return res.json([]);
    }

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email phone headline location about skills experience education links')
      .populate('job', 'title location companyName')
      .sort({ appliedAt: -1 });

    return res.json(applications);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

const getRecruiterApplicationDetails = async (req, res) => {
  try {
    if (!['recruiter', 'employer'].includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiter accounts can review applications.' });
    }

    const application = await Application.findById(req.params.applicationId)
      .select('+resumeData')
      .populate('candidate', 'name email phone headline location about skills experience education links')
      .populate('job', 'title location companyName postedBy recruiter user');

    if (!application || !application.job) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const recruiterId = String(req.user._id);
    const ownsJob = [application.job.postedBy, application.job.recruiter, application.job.user]
      .some((ownerId) => ownerId && String(ownerId) === recruiterId);
    if (!ownsJob) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.json(application);
  } catch (err) {
    return res.status(500).json({ message: 'Error loading application details', error: err.message });
  }
};

const updateRecruiterApplicationStatus = async (req, res) => {
  try {
    if (!['recruiter', 'employer'].includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Only recruiter accounts can update application status.' });
    }

    const { status } = req.body;
    if (!['Interview', 'Rejected', 'On Hold'].includes(status)) {
      return res.status(400).json({ message: 'Choose Interview, Rejected, or On Hold.' });
    }

    const application = await Application.findById(req.params.applicationId).select('job candidate status');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const job = await Job.findById(application.job).select('title postedBy recruiter user');
    if (!job) return res.status(404).json({ message: 'Application not found.' });

    const recruiterId = String(req.user._id);
    const ownsJob = [job.postedBy, job.recruiter, job.user]
      .some((ownerId) => ownerId && String(ownerId) === recruiterId);
    if (!ownsJob) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (application.status !== status) {
      await Notification.create({
        recipient: application.candidate,
        application: updatedApplication._id,
        status,
        message: `Your application for ${job.title || 'a job'} is now ${status === 'Interview' ? 'invited for an interview' : status === 'Rejected' ? 'rejected' : 'on hold'}.`
      });
    }
    return res.json({ message: 'Application status updated.', application: updatedApplication });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating application status', error: err.message });
  }
};

// 4. Get Candidate Applications for Tracker Page
const getCandidateApplications = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'candidate') {
      return res.status(403).json({ message: 'Only candidate accounts can view candidate applications.' });
    }

    const applications = await Application.find({ candidate: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });

    return res.json(applications);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

module.exports = {
  applyForJob,
  checkApplicationStatus,
  getRecruiterApplications,
  getRecruiterApplicationDetails,
  updateRecruiterApplicationStatus,
  getCandidateApplications
};
