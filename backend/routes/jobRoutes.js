const express =
  require("express");

const router =
  express.Router();

const {

  createJob,
  getJobs

} = require(
  "../controllers/jobController"
);

const {

  protect,
  adminOnly

} = require(
  "../middleware/authMiddleware"
);

/* CREATE JOB */
router.post(

  "/",

  protect,
  adminOnly,

  createJob

);

/* GET JOBS */
router.get(

  "/",

  getJobs

);

module.exports =
  router;