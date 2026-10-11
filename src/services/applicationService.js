import axios from "axios";

const API =
  "http://localhost:5000/api/applications";

/* APPLY JOB */
export const applyJob =
  async (jobId, token) => {

    const response =
      await axios.post(

        `${API}/apply`,

        { jobId },

        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }

      );

    return response.data;

};

/* GET USER APPLICATIONS */
export const getMyApplications =
  async (token) => {

    const response =
      await axios.get(

        `${API}/my-applications`,

        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }

      );

    return response.data;

};
/* UPDATE STATUS */
export const updateStatus =
  async (
    applicationId,
    status,
    token
  ) => {

    const response =
      await axios.put(

        `${API}/status`,

        {
          applicationId,
          status
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    return response.data;

};

/* GET ALL APPLICATIONS */
export const getAllApplications =
  async (token) => {

    const response =
      await axios.get(

        `${API}/all`,

        {

          headers: {

            Authorization:
              `Bearer ${token}`

          }

        }

      );

    return response.data;

};