
import "./Navbar.css";
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({
  currentUser,
  handleLogout,
  notifications = [],
  setNotifications = () => {},
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAllRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const logout = () => {
    setShowProfile(false);

    if (typeof handleLogout === "function") {
      handleLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  const menuItems = [
    { label: "Tracker", path: "/tracker" },
    { label: "Jobs", path: "/jobs" },
    { label: "Saved Jobs", path: "/saved-jobs" },
    { label: "AI Assistant", path: "/ai-assistant" },
  ];

  return (
    <header className="jobnest-header">
      <div className="navbar">
        {/* BRAND */}
        <NavLink to="/jobs" className="brand">
          <span className="brand-name">JobNest</span>
          <span className="brand-dot">.</span>
        </NavLink>

        {/* NAVIGATION */}
        <nav className="nav-links" aria-label="Main navigation">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="nav-actions">
          {/* NOTIFICATIONS */}
          <div className="dropdown-container" ref={notificationRef}>
            <button
              type="button"
              className="notification-button"
              aria-label={`Notifications${
                unreadCount ? `, ${unreadCount} unread` : ""
              }`}
              aria-expanded={showNotifications}
              onClick={() => {
                setShowNotifications((previous) => !previous);
                setShowProfile(false);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-heading">
                  <div>
                    <h3>Notifications</h3>
                    <p>
                      {unreadCount
                        ? `${unreadCount} unread notification${
                            unreadCount === 1 ? "" : "s"
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <p className="empty-notifications">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={notification.id ?? index}
                        className={`notification-item ${
                          notification.read ? "is-read" : "is-unread"
                        }`}
                      >
                        {!notification.read && (
                          <span className="unread-dot" />
                        )}

                        <p>{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="action-divider" />

          {/* PROFILE */}
          <div className="dropdown-container" ref={profileRef}>
            <button
              type="button"
              className={`profile-button ${
                showProfile ? "profile-button-open" : ""
              }`}
              aria-expanded={showProfile}
              aria-haspopup="menu"
              onClick={() => {
                setShowProfile((previous) => !previous);
                setShowNotifications(false);
              }}
            >
              <span className="profile-avatar">
                {(currentUser?.name || "U")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </span>

              <span className="profile-user-details">
                <span className="profile-user-name">
                  {currentUser?.name || "My Account"}
                </span>
                <span className="profile-user-label">
                  {currentUser?.role === "admin"
                    ? "Administrator"
                    : "Account"}
                </span>
              </span>

              <svg
                className={`profile-chevron ${
                  showProfile ? "chevron-open" : ""
                }`}
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {showProfile && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-header">
                  <span className="profile-avatar dropdown-avatar">
                    {(currentUser?.name || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div className="profile-dropdown-user">
                    <strong>
                      {currentUser?.name || "User"}
                    </strong>
                    <span>{currentUser?.email || ""}</span>
                  </div>
                </div>

                <div className="dropdown-separator" />

                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/profile");
                  }}
                >
                  My Profile
                </button>

                <div className="dropdown-separator" />

                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item logout-menu-item"
                  onClick={logout}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
