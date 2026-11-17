import axios from "axios";
import { API_BASE_URL } from './apiConfig';

const API =
  `${API_BASE_URL}/jobs`;

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
