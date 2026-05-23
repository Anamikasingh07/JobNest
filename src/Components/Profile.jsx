import { useState } from "react";
import "./Profile.css";

const Profile = () => {

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Anamika Singh",
    role: "Frontend Developer",
    email: "anamika@gmail.com",
    about:
      "Passionate frontend developer focused on building modern UI.",
    skills: "React, JavaScript, CSS, UI/UX"
  });

  // handle input changes
  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="profile-page">

      <div className="profile-card">

        {/* TOP */}
        <div className="profile-top">

          <div className="profile-avatar">
            {profile.name[0]}
          </div>

          <div>

            {isEditing ? (

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
              />

            ) : (

              <h2>{profile.name}</h2>

            )}

            {isEditing ? (

              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange}
              />

            ) : (

              <p>{profile.role}</p>

            )}

          </div>

        </div>

        {/* EMAIL */}
        <div className="profile-section">

          <h3>📧 Email</h3>

          {isEditing ? (

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
            />

          ) : (

            <p>{profile.email}</p>

          )}

        </div>

        {/* SKILLS */}
        <div className="profile-section">

          <h3>🛠 Skills</h3>

          {isEditing ? (

            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
            />

          ) : (

            <div className="skills">

              {profile.skills
                .split(",")
                .map((skill, index) => (

                  <span key={index}>
                    {skill.trim()}
                  </span>

              ))}

            </div>

          )}

        </div>

        {/* ABOUT */}
        <div className="profile-section">

          <h3>📝 About</h3>

          {isEditing ? (

            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
            />

          ) : (

            <p>{profile.about}</p>

          )}

        </div>

        {/* BUTTON */}
        <button
          className="edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >

          {isEditing ? "Save Profile" : "Edit Profile"}

        </button>

      </div>

    </div>
  );
};

export default Profile;