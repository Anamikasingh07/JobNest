const express =
  require("express");

const router =
  express.Router();

const {

  applyJob,
  getUserApplications,
  getAllApplications

} = require(

  "../controllers/applicationController"

);

const {

  protect,
  adminOnly

} = require(

  "../middleware/authMiddleware"

);

/* APPLY JOB */
router.post(

  "/apply",

  protect,

  applyJob

);

/* USER APPLICATIONS */
router.get(

  "/my-applications",

  protect,

  getUserApplications

);

/* ADMIN APPLICATIONS */
router.get(

  "/all",

  protect,
  adminOnly,

  getAllApplications

);

module.exports =
  router;