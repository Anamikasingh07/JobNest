import "./ProfilePage.css";
import { useState } from "react";

const ProfilePage = ({
  currentUser,
  setCurrentUser
}) => {

  const [profileData, setProfileData] =
    useState({

      name:
        currentUser?.name || "",

      email:
        currentUser?.email || "",

      skills:
        currentUser?.skills || "",

      bio:
        currentUser?.bio || ""

    });

  const [resume, setResume] =
    useState(

      currentUser?.resume || null

    );

  /* SAVE PROFILE */
  const handleSave = () => {

    const updatedUser = {

      ...currentUser,

      ...profileData,

      resume

    };

    /* UPDATE CURRENT USER */
    localStorage.setItem(

      "currentUser",

      JSON.stringify(updatedUser)

    );

    /* UPDATE USERS ARRAY */
    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const updatedUsers = users.map(
      (u) =>

        u.email ===
        currentUser.email

          ? updatedUser

          : u
    );

    localStorage.setItem(

      "users",

      JSON.stringify(updatedUsers)

    );

    setCurrentUser(updatedUser);

    alert("Profile Updated");

  };

  /* FILE UPLOAD */
  const handleResumeUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setResume(file.name);

  };

  return (

    <div className="profile-page">

      <h2>Profile</h2>

      <div className="profile-form">

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"

          value={profileData.name}

          onChange={(e) =>
            setProfileData({

              ...profileData,

              name:
                e.target.value

            })
          }
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"

          value={profileData.email}

          onChange={(e) =>
            setProfileData({

              ...profileData,

              email:
                e.target.value

            })
          }
        />

        {/* SKILLS */}
        <input
          type="text"
          placeholder="Skills"

          value={profileData.skills}

          onChange={(e) =>
            setProfileData({

              ...profileData,

              skills:
                e.target.value

            })
          }
        />

        {/* BIO */}
        <textarea
          placeholder="Bio"

          value={profileData.bio}

          onChange={(e) =>
            setProfileData({

              ...profileData,

              bio:
                e.target.value

            })
          }
        />

        {/* RESUME */}
        <div className="resume-box">

          <label>
            Upload Resume (PDF)
          </label>

          <input
            type="file"
            accept=".pdf"

            onChange={
              handleResumeUpload
            }
          />

          {resume && (

            <p>
              Uploaded:
              {" "}
              {resume}
            </p>

          )}

        </div>

        {/* BUTTON */}
        <button
          onClick={handleSave}
        >
          Save Profile
        </button>

      </div>

    </div>

  );

};

export default ProfilePage;