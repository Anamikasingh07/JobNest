
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");

const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body || {};

    if (
      !jobId ||
      !mongoose.isValidObjectId(jobId)
    ) {
      return res.status(400).json({
        message: "A valid job ID is required",
      });
    }

    const jobExists = await Job.exists({
      _id: jobId,
    });

    if (!jobExists) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const existingApplication = await Application.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "Already applied",
      });
    }

    const application = await Application.create({
      user: req.user.id,
      job: jobId,
    });

    return res.status(201).json({
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    console.error("Apply job error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      user: req.user.id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Get user applications error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("user", "-password")
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Get all applications error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body || {};

    if (
      !applicationId ||
      !mongoose.isValidObjectId(applicationId)
    ) {
      return res.status(400).json({
        message: "A valid application ID is required",
      });
    }

    if (
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        message: "A valid status is required",
      });
    }

    const application = await Application.findById(
      applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = status.trim();

    await application.save();

    return res.status(200).json({
      message: "Status updated",
      application,
    });
  } catch (error) {
    console.error("Update application status error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  applyJob,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
};
