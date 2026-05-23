import "./Sidebar.css";

const Sidebar = ({
  role,
  activePage,
  setActivePage
}) => {


{role === "admin" && (

  <button

    className={
      activePage ===
      "admin-applications"

      ? "menu-btn active"

      : "menu-btn"
    }

    onClick={() =>
      setActivePage(
        "admin-applications"
      )
    }

  >

    📄 Applications

  </button>

)}



  return (

    <div className="sidebar">

      {/* USER MENU */}
      {role === "user" && (

        <>

          <button
            className={
              activePage === "tracker"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("tracker")
            }
          >
            📊 Tracker
          </button>

          <button
            className={
              activePage === "jobs"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("jobs")
            }
          >
            💼 Jobs
          </button>

          <button
            className={
              activePage === "saved"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("saved")
            }
          >
            ❤️ Saved Jobs
          </button>

          <button
            className={
              activePage === "ai"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("ai")
            }
          >
            🤖 AI Assistant
          </button>

          <button
            className={
              activePage === "profile"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("profile")
            }
          >
            👤 Profile
          </button>

        </>

      )}

      {/* ADMIN MENU */}
      {role === "admin" && (

        <>

          <button
            className={
              activePage === "admin-dashboard"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage(
                "admin-dashboard"
              )
            }
          >
            📈 Dashboard
          </button>

          <button
            className={
              activePage === "manage-jobs"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage(
                "manage-jobs"
              )
            }
          >
            💼 Manage Jobs
          </button>



          <button
            className={
              activePage === "applications"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage(
                "applications"
              )
            }
          >
            📋 Applications
          </button>

          <button
            className={
              activePage === "reports"
                ? "menu-btn active"
                : "menu-btn"
            }

            onClick={() =>
              setActivePage("reports")
            }
          >
            📊 Reports
          </button>

        </>

      )}

    </div>
  );
};

export default Sidebar;