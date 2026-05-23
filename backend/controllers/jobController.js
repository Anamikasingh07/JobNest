const Job =
  require("../models/Job");

/* CREATE JOB */
const createJob =
  async (req, res) => {

    try {

      const {

        title,
        company,
        location,
        salary,
        description,
        skills

      } = req.body;

      const job =
        await Job.create({

          title,
          company,
          location,
          salary,
          description,
          skills,

          createdBy:
            req.user.id

        });

      res.status(201).json({

        message:
          "Job created successfully",

        job

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

/* GET ALL JOBS */
const getJobs =
  async (req, res) => {

    try {

      const jobs =
        await Job.find()
          .sort({

            createdAt: -1

          });

      res.status(200).json(
        jobs
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

  createJob,
  getJobs

};