import "./AdminDashboard.css";

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

          {jobs.map((job) => (

            <div
              className="recent-item"
              key={job.id}
            >

              <div>

                <strong>
                  {job.company}
                </strong>

                <p>{job.role}</p>

              </div>

              <span>
                {job.status}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;