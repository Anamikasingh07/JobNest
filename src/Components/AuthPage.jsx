import "./AuthPage.css";

import { useState } from "react";

import {

  registerUser,
  loginUser

} from "../services/authService";

const AuthPage = ({

  setCurrentUser,
  setRole

}) => {

  const [isLogin, setIsLogin] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({

      name: "",
      email: "",
      password: "",
      role: "user"

    });

  /* HANDLE CHANGE */
  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };

  /* SUBMIT */
  const handleSubmit =
    async () => {

      try {

        setLoading(true);

        /* LOGIN */
        if (isLogin) {

          const data =
            await loginUser({

              email:
                formData.email,

              password:
                formData.password

            });

          /* SAVE TOKEN */
          localStorage.setItem(

            "token",
            data.token

          );

          /* SAVE USER */
          localStorage.setItem(

            "currentUser",

            JSON.stringify(
              data.user
            )

          );

          setCurrentUser(
            data.user
          );

          setRole(
            data.user.role
          );

          alert(
            "Login successful"
          );

        }

        /* REGISTER */
        else {

          const data =
            await registerUser(
              formData
            );

          alert(
            data.message
          );

          /* AUTO LOGIN AFTER REGISTER */

          const loginData =
            await loginUser({

              email:
                formData.email,

              password:
                formData.password

            });

          localStorage.setItem(

            "token",
            loginData.token

          );

          localStorage.setItem(

            "currentUser",

            JSON.stringify(
              loginData.user
            )

          );

          setCurrentUser(
            loginData.user
          );

          setRole(
            loginData.user.role
          );

        }

      }

      catch (error) {

        console.log(error);

        alert(

          error.response?.data
            ?.message ||

          "Something went wrong"

        );

      }

      finally {

        setLoading(false);

      }

    };

  return (

    <div className="auth-page">

      <div className="auth-box">

        <h2>

          {isLogin
            ? "Login"
            : "Create Account"}

        </h2>

        {/* NAME */}
        {!isLogin && (

          <input
            type="text"
            name="name"
            placeholder="Name"

            value={formData.name}

            onChange={handleChange}
          />

        )}

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"

          value={formData.email}

          onChange={handleChange}
        />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"

          value={formData.password}

          onChange={handleChange}
        />

        {/* ROLE */}
        {!isLogin && (

          <select
            name="role"

            value={formData.role}

            onChange={handleChange}
          >

            <option value="user">
              User
            </option>

            <option value="admin">
              Admin
            </option>

          </select>

        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
        >

          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Register"}

        </button>

        {/* TOGGLE */}
        <p>

          {isLogin
            ? "Don't have an account?"
            : "Already have account?"}

          <span
            onClick={() =>
              setIsLogin(!isLogin)
            }
          >

            {isLogin
              ? " Register"
              : " Login"}

          </span>

        </p>

      </div>

    </div>

  );

};

export default AuthPage;