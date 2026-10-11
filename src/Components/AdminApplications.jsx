import "./AdminApplications.css";

const AdminApplications = ({
  jobs,
  updateJobStatus
}) => {

  return (

    <div className="admin-applications">

      <h2>All Applications</h2>

      {jobs.length === 0 ? (

        <p>No applications found</p>

      ) : (

        <div className="applications-grid">

          {jobs.map((application) => (

            <div
              className="application-card"
              key={application._id}
            >

              <h3>
                {application.job?.company}
              </h3>

              <p>
                {application.job?.title}
              </p>

              <p>
                Applicant:
                {" "}
                {application.user?.name}
              </p>

              <h4>
                Status:
                {" "}
                {application.status}
              </h4>

              <div className="status-buttons">

                <button
                  onClick={() =>
                    updateJobStatus(
                      application._id,
                      "Interview"
                    )
                  }
                >
                  Interview
                </button>

                <button
                  onClick={() =>
                    updateJobStatus(
                      application._id,
                      "Rejected"
                    )
                  }
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    updateJobStatus(
                      application._id,
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