const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getJobs = async (req, res) => {
  try {
    const { q, location, type, minSalary, workStyle, page = 1, limit = 10 } = req.query;
    const filter = { isOpen: true };

    if (q) {
      filter.$text = { $search: q };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      filter.jobType = type;
    }
    if (workStyle) {
      filter.workStyle = workStyle;
    }
    if (minSalary) {
      filter.salaryMin = { $gte: Number(minSalary) };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Job.countDocuments(filter)
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};