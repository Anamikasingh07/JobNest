
const Job = require("../models/Job");

const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      description,
      skills,
    } = req.body || {};

    if (
      typeof title !== "string" || !title.trim() ||
      typeof company !== "string" || !company.trim() ||
      typeof location !== "string" || !location.trim() ||
      typeof description !== "string" || !description.trim()
    ) {
      return res.status(400).json({
        message: "Title, company, location, and description are required",
      });
    }

    if (
      skills !== undefined &&
      (!Array.isArray(skills) ||
        !skills.every((skill) => typeof skill === "string"))
    ) {
      return res.status(400).json({
        message: "Skills must be an array of strings",
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      salary,
      description: description.trim(),
      skills: skills || [],
      createdBy: req.user.id,
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error.message);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
};
