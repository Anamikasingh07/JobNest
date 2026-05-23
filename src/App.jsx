import "./App.css";

import { useState, useEffect } from "react";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

import TrackerPage from "./Components/TrackerPage";
import Joblist from "./Components/Joblist";

import {

  applyJob,
  getMyApplications,
  getAllApplications

} from "./services/applicationService";

import AdminDashboard from "./Components/AdminDashboard";
import ManageJobs from "./Components/ManageJobs";
import AdminApplications from "./Components/AdminApplications";

import AuthPage from "./Components/AuthPage";
import ProfilePage from "./Components/ProfilePage";
import AIPage from "./Components/AIPage";

import {
  getJobs
} from "./services/jobService";

function App() {

  /* =========================
     AUTH USER
  ========================= */

  const [currentUser,
  setCurrentUser] = useState(

    JSON.parse(
      localStorage.getItem(
        "currentUser"
      )
    ) || null

);

const [role,
  setRole] = useState(

    JSON.parse(
      localStorage.getItem(
        "currentUser"
      )
    )?.role || ""

);
  /* =========================
     ACTIVE PAGE
  ========================= */

  const [activePage, setActivePage] =
    useState("tracker");

  /* =========================
     AVAILABLE JOBS
  ========================= */
/* =========================
   ALL JOBS FROM DATABASE
========================= */

const [jobs, setJobs] =
  useState([]);

/* =========================
   APPLIED JOBS
========================= */

const [appliedJobs, setAppliedJobs] =
  useState([]);

  useEffect(() => {

  if (currentUser) {

    fetchApplications();

  }

}, [currentUser]);

const fetchApplications =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const data =
        await getMyApplications(
          token
        );

      setAppliedJobs(data);

    }

    catch (error) {

      console.log(error);

    }

};



const [

  adminApplications,
  setAdminApplications

] = useState([]);


const fetchAdminApplications =
  async () => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      const data =
        await getAllApplications(
          token
        );

      setAdminApplications(
        data
      );

    }

    catch (error) {

      console.log(error);

    }

};

useEffect(() => {

  if (
    currentUser &&
    role === "admin"
  ) {

    fetchAdminApplications();

  }

}, [currentUser, role]);
  /* =========================
     SAVED JOBS
  ========================= */

  const [savedJobs, setSavedJobs] =
    useState(() => {

      const storedSavedJobs =
        localStorage.getItem(
          "savedJobs"
        );

      return storedSavedJobs
        ? JSON.parse(
            storedSavedJobs
          )
        : [];

    });


    /* =========================
   NOTIFICATIONS
========================= */

const [notifications, setNotifications] =
  useState(() => {

    const storedNotifications =
      localStorage.getItem(
        "notifications"
      );

    return storedNotifications
      ? JSON.parse(
          storedNotifications
        )
      : [];

  });

  /* =========================
     LOCAL STORAGE
  ========================= */

  /* =========================
   FETCH JOBS FROM BACKEND
========================= */

useEffect(() => {

  fetchJobs();

}, []);

const fetchJobs =
  async () => {

    try {

      const data =
        await getJobs();

      setJobs(data);

    }

    catch (error) {

      console.log(error);

    }

};

/* =========================
   SAVE APPLIED JOBS
========================= */

useEffect(() => {

  localStorage.setItem(

    "appliedJobs",

    JSON.stringify(
      appliedJobs
    )

  );

}, [appliedJobs]);

  useEffect(() => {

    localStorage.setItem(
      "savedJobs",
      JSON.stringify(savedJobs)
    );

  }, [savedJobs]);

  /* =========================
     ROLE PAGE SWITCH
  ========================= */

  useEffect(() => {

    if (role === "admin") {

      setActivePage(
        "admin-dashboard"
      );

    }

    else {

      setActivePage("tracker");

    }

  }, [role]);



  useEffect(() => {

  localStorage.setItem(

    "notifications",

    JSON.stringify(
      notifications
    )

  );

}, [notifications]);


const handleApply =
  async (job) => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await applyJob(
        job._id,
        token
      );

      alert(
        "Applied Successfully"
      );

      fetchApplications();

      setNotifications((prev) => [

        {

          id: Date.now(),

          message:
            `Applied to ${job.company}`,

          read: false

        },

        ...prev

      ]);

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data
          ?.message ||

        "Application Failed"

      );

    }

};

  /* =========================
     SAVE JOB
  ========================= */

  const handleSaveJob = (job) => {

    setSavedJobs((prev) => {

      const exists = prev.find(
        (j) => j.id === job.id
      );

      if (exists) return prev;

      return [...prev, job];

    });

  };

  /* =========================
     UPDATE JOB STATUS
  ========================= */
const updateJobStatus = (
  id,
  newStatus
) => {

  setNotifications((prev) => [

    {

      id: Date.now(),

      message:
        `Application moved to ${newStatus}`,

      read: false

    },

    ...prev

  ]);

  setAppliedJobs((prev) =>

    prev.map((job) =>

      job._id === id

        ? {
            ...job,
            status: newStatus
          }

        : job

    )

  );

};
  /* =========================
     LOGOUT
  ========================= */

 const handleLogout = () => {

  localStorage.removeItem(
    "currentUser"
  );

  localStorage.removeItem(
    "token"
  );

  setCurrentUser(null);

  setRole("");

};

  /* =========================
     AUTH CHECK
  ========================= */

  if (!currentUser) {

    return (

      <AuthPage

        setCurrentUser={
          setCurrentUser
        }

        setRole={setRole}

      />

    );

  }

  /* =========================
     MAIN RETURN
  ========================= */

  return (

    <div className="app">

      {/* NAVBAR */}
      <Navbar

  role={role}

  setRole={setRole}

  currentUser={
    currentUser
  }

  handleLogout={
    handleLogout
  }

  notifications={
    notifications
  }

  setNotifications={
    setNotifications
  }

/>

      {/* CONTENT */}
      <div className="content">

        {/* SIDEBAR */}
        <Sidebar

          role={role}

          activePage={
            activePage
          }

          setActivePage={
            setActivePage
          }

        />

        {/* MAIN CONTENT */}
        <div className="main-content">

          {/* =====================
              USER PAGES
          ===================== */}

          {/* TRACKER */}
          {role === "user" &&
            activePage ===
              "tracker" && (

              <TrackerPage

               jobs={appliedJobs.map(
  (app) => ({

    ...app.job,

    status: app.status,

    appliedDate:
      app.appliedDate

  })
)}

                updateJobStatus={
                  updateJobStatus
                }

              />

            )}

          {/* JOBS */}
          {role === "user" &&
            activePage === "jobs" && (

              <Joblist

                jobs={jobs}

                onApply={
                  handleApply
                }

                onSave={
                  handleSaveJob
                }

              />

            )}

          {/* SAVED JOBS */}
          {role === "user" &&
            activePage ===
              "saved" && (

              <div>

                <h2>
                  Saved Jobs
                </h2>

                <br />

                <div className="job-grid">

                  {savedJobs.length ===
                  0 ? (

                    <p>
                      No saved jobs
                    </p>

                  ) : (

                    savedJobs.map(
                      (job) => (

                        <div
                          className="job-box"
                          key={job.id}
                        >

                          <h3>
                            {
                              job.company
                            }
                          </h3>

                          <p>
                            {job.role}
                          </p>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )}

          {/* AI MATCH */}
          {role === "user" &&
            activePage === "ai" && (

              <AIPage

                currentUser={
                  currentUser
                }

               availableJobs={jobs}

              />

            )}

          {/* PROFILE */}
          {role === "user" &&
            activePage ===
              "profile" && (

              <ProfilePage

                currentUser={
                  currentUser
                }

                setCurrentUser={
                  setCurrentUser
                }

              />

            )}


            
{role === "user" &&
  activePage ===
    "notifications" && (

    <NotificationsPage

      notifications={
        notifications
      }

      setNotifications={
        setNotifications
      }

    />

)}

          {/* =====================
              ADMIN PAGES
          ===================== */}

          {/* ADMIN DASHBOARD */}
          {role === "admin" &&
            activePage ===
              "admin-dashboard" && (

              <AdminDashboard
              jobs={appliedJobs}

                savedJobs={
                  savedJobs
                }

             

               availableJobs={jobs}

              />

            )}

          {/* MANAGE JOBS */}
          {role === "admin" &&
            activePage ===
              "manage-jobs" && (

              <ManageJobs

                availableJobs={jobs}

                setAvailableJobs={setJobs}
              />

            )}

          {/* ADMIN APPLICATIONS */}
          {role === "admin" &&
            activePage ===
              "admin-applications" && (

              <AdminApplications

                jobs={adminApplications}

                updateJobStatus={
                  updateJobStatus
                }

              />

            )}

        </div>

      </div>

    </div>

  );

}

export default App;