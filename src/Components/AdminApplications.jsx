import "./AdminApplications.css";

const AdminApplications = ({
  jobs,
  updateJobStatus
}) => {

  return (

    <div className="admin-applications">

      <h2>
        All Applications
      </h2>

      {jobs.length === 0 ? (

        <p>
          No applications found
        </p>

      ) : (

        <div className="applications-grid">

          {jobs.map((job) => (

            <div
              className="application-card"
              key={job.id}
            >

              <h3>
                {job.company}
              </h3>

              <p>
                {job.role}
              </p>

              <h4>
                Status:
                {" "}
                {job.status}
              </h4>

              {/* STATUS BUTTONS */}
              <div className="status-buttons">

                <button
                  onClick={() =>
                    updateJobStatus(
                      job.id,
                      "Interview"
                    )
                  }
                >
                  Interview
                </button>

                <button
                  onClick={() =>
                    updateJobStatus(
                      job.id,
                      "Rejected"
                    )
                  }
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    updateJobStatus(
                      job.id,
                      "Selected"
                    )
                  }
                >
                  Select
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default AdminApplications;