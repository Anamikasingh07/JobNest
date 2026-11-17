import axios from "axios";
import { API_BASE_URL } from './apiConfig';

const API =
  `${API_BASE_URL}/auth`;

/* REGISTER */
export const registerUser =
  async (userData) => {

    const response =
      await axios.post(

        `${API}/register`,
        userData

      );

    return response.data;

};

/* LOGIN */
export const loginUser =
  async (userData) => {

    const response =
      await axios.post(

        `${API}/login`,
        userData

      );

    return response.data;

};

