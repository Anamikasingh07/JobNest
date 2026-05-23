const Application =
  require("../models/Application");

/* APPLY JOB */
const applyJob =
  async (req, res) => {

    try {

      const { jobId } =
        req.body;

      /* CHECK EXISTING */
      const exists =
        await Application.findOne({

          user: req.user.id,

          job: jobId

        });

      if (exists) {

        return res.status(400)
          .json({

            message:
              "Already applied"

          });

      }

      const application =
        await Application.create({

          user: req.user.id,

          job: jobId

        });

      res.status(201).json({

        message:
          "Applied successfully",

        application

      });

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

};

/* GET USER APPLICATIONS */
const getUserApplications =
  async (req, res) => {

    try {

      const applications =
        await Application.find({

          user: req.user.id

        }).populate("job");

      res.status(200).json(
        applications
      );

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

};

/* GET ALL APPLICATIONS */
const getAllApplications =
  async (req, res) => {

    try {

      const applications =
        await Application.find()

          .populate("user")

          .populate("job");

      res.status(200).json(
        applications
      );

    }

    catch (error) {

      console.log(error);

      res.status(500).json({

        message:
          "Server Error"

      });

    }

};

module.exports = {

  applyJob,
  getUserApplications,
  getAllApplications

};