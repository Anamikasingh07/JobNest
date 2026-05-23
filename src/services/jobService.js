import axios from "axios";

const API =
  "http://localhost:5000/api/jobs";

/* GET ALL JOBS */
export const getJobs =
  async () => {

    const response =
      await axios.get(API);

    return response.data;

};

/* CREATE JOB */
export const createJob =
  async (jobData, token) => {

    const response =
      await axios.post(

        API,

        jobData,

        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }

      );

    return response.data;

};