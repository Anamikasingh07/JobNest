
const express = require("express");
const router = express.Router();

const {
  applyJob,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

router.post("/apply", protect, applyJob);

router.get(
  "/my-applications",
  protect,
  getUserApplications
);

router.get(
  "/all",
  protect,
  adminOnly,
  getAllApplications
);

router.put(
  "/status",
  protect,
  adminOnly,
  updateApplicationStatus
);

module.exports = router;
