import "./Navbar.css";

import { useState } from "react";

const Navbar = ({

  currentUser,

  handleLogout,

  notifications,

  setNotifications

}) => {

  const [showNotifications,
    setShowNotifications] =
      useState(false);

  /* MARK ALL READ */
  const markAllRead = () => {

    const updated =
      notifications.map((n) => ({

        ...n,

        read: true

      }));

    setNotifications(updated);

  };

  /* UNREAD COUNT */
  const unreadCount =
    notifications.filter(
      (n) => !n.read
    ).length;

  return (

    <div className="navbar">

      {/* LOGO */}
      <div className="logo">

        JobNest

      </div>

      {/* RIGHT */}
      <div className="nav-right">

        {/* NOTIFICATION */}
        <div className="notification-wrapper">

          <button

            className="notification-btn"

            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }

          >

            🔔

            {unreadCount > 0 && (

              <span className="badge">

                {unreadCount}

              </span>

            )}

          </button>

          {/* DROPDOWN */}
          {showNotifications && (

            <div className="notification-dropdown">

              <div className="drop-header">

                <h4>
                  Notifications
                </h4>

                <button
                  onClick={
                    markAllRead
                  }
                >

                  Mark all

                </button>

              </div>

              {notifications.length ===
              0 ? (

                <p className="empty">

                  No notifications

                </p>

              ) : (

                notifications.map((n) => (

                  <div

                    key={n.id}

                    className={
                      n.read

                        ? "note-item read"

                        : "note-item"
                    }

                  >

                    {n.message}

                  </div>

                ))

              )}

            </div>

          )}

        </div>

        {/* USER */}
        <div className="user-box">

          <span>

            {currentUser?.name}

          </span>

          <button
            onClick={handleLogout}
          >

            Logout

          </button>

        </div>

      </div>

    </div>

  );

};

export default Navbar;