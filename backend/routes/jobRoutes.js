
const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobs,
} = require("../controllers/jobController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createJob);
router.get("/", getJobs);

module.exports = router;
