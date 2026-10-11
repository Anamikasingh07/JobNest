import "./App.css";

import { useState, useEffect } from "react";

import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

import TrackerPage from "./Components/TrackerPage";
import Joblist from "./Components/Joblist";


import {

  applyJob,
  getMyApplications,
  getAllApplications,
   updateStatus

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

const fetchApplications = async () => {

  try {

    const token = localStorage.getItem("token");

    const data = await getMyApplications(token);

    console.log("========== APPLICATIONS ==========");
    console.log(data);

    setAppliedJobs(data);

  }

  catch (error) {

    console.log(error);

  }

};
useEffect(() => {

  console.log("STATE APPLIED JOBS");
  console.log(appliedJobs);

}, [appliedJobs]);



const [

  adminApplications,
  setAdminApplications

] = useState([]);


const fetchAdminApplications = async () => {

  console.log("========== FETCH ADMIN APPLICATIONS ==========");

  try {

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    const data = await getAllApplications(token);

    console.log("ADMIN APPLICATIONS:");
    console.log(data);

    setAdminApplications(data);

  }

  catch (error) {

    console.log("ADMIN APPLICATION ERROR");

    console.log(error.response?.data);

    console.log(error);

  }

};
useEffect(() => {

  console.log("ROLE:", role);

  console.log("CURRENT USER:", currentUser);

  if (currentUser && role === "admin") {

    console.log("CALLING fetchAdminApplications()");

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

const fetchJobs = async () => {

    try {

        const data = await getJobs();

        console.log("========== FRONTEND JOBS ==========");
        console.log(data);

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


const handleApply = async (job) => {

  const token = localStorage.getItem("token");

  try {

    const response = await applyJob(job._id, token);

    console.log(response);

    await fetchApplications();   // <-- Refresh tracker

    setActivePage("tracker");    // optional

  }

  catch (err) {

    console.log(err.response?.data);

  }

};
  /* =========================
     SAVE JOB
  ========================= */

  const handleSaveJob = (job) => {

    setSavedJobs((prev) => {

      const exists = prev.find(
        (j) => j.id === job._id
      );

      if (exists) return prev;

      return [...prev, job];

    });

  };

  /* =========================
     UPDATE JOB STATUS
  ========================= */
const updateJobStatus = async (applicationId, newStatus) => {

  try {

    console.log("Updating:", applicationId, newStatus);

    const token = localStorage.getItem("token");

    const response = await updateStatus(
      applicationId,
      newStatus,
      token
    );

    console.log(response);

    await fetchApplications();

    await fetchAdminApplications();

  }

  catch (error) {

    console.log(error.response?.data);
    console.log(error);

  }

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

             jobs={appliedJobs.map((app) => ({

  ...app.job,

  _id: app._id,

  status: app.status,

  appliedDate: app.appliedDate

}))}
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
                          key={job._id}
                        >

                          <h3>
                            {
                              job.company
                            }
                          </h3>

                          <p>
                            {job.title}
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
              jobs={adminApplications}

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