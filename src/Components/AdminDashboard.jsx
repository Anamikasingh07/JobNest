import "./AdminDashboard.css";
import {
  updateStatus
}
from "../services/applicationService";
const AdminDashboard = ({
  jobs,
  savedJobs,
  availableJobs
}) => {



  return (

    <div className="admin-dashboard">

      <h2>Admin Dashboard</h2>

      {/* STATS */}
      <div className="admin-stats">

        <div className="admin-card">

          <h3>
            {availableJobs.length}
          </h3>

          <p>Total Jobs</p>

        </div>

        <div className="admin-card">

          <h3>
            {jobs.length}
          </h3>

          <p>Total Applications</p>

        </div>

        <div className="admin-card">

          <h3>

            {
              jobs.filter(
                (job) =>
                  job.status === "Interview"
              ).length
            }

          </h3>

          <p>Interviews</p>

        </div>

        <div className="admin-card">

          <h3>
            {savedJobs.length}
          </h3>

          <p>Saved Jobs</p>

        </div>

      </div>

      {/* RECENT APPLICATIONS */}
      <div className="recent-section">

        <h3>Recent Applications</h3>

        <div className="recent-list">

          {jobs.map((application) => (

  <div
    className="recent-item"
    key={application._id}
  >

    <div>

      <strong>
        {application.job?.company}
      </strong>

      <p>
        {application.job?.title}
      </p>

      <small>
        {application.user?.name}
      </small>

    </div>

    <span>
      {application.status}
    </span>

  </div>

))}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;