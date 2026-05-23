import "./Jobcard.css";

const JobCard = ({
  job,
  updateJobStatus
}) => {

  return (

    <div
      className={`job-card ${job.status.toLowerCase()}-card`}
    >

      {/* TOP */}
      <div className="job-top">

        <div>

          <h4>{job.company}</h4>

          <p>{job.role}</p>

        </div>

        <span
          className={`priority ${job.priority.toLowerCase()}`}
        >
          {job.priority}
        </span>

      </div>

      {/* DATE */}
      <div className="job-info">

        📅 Applied:
        {" "}
        {job.appliedDate}

      </div>

      {/* NOTES */}
      <div className="job-notes">

        📝
        {" "}
        {job.notes || "No notes added"}

      </div>

      {/* BUTTONS */}
      <div className="tracker-buttons">

        {job.status !== "Interview" && (

          <button
            className="interview-btn"
            onClick={() =>
              updateJobStatus(
                job.id,
                "Interview"
              )
            }
          >
            Interview
          </button>

        )}

        {job.status !== "Rejected" && (

          <button
            className="reject-btn"
            onClick={() =>
              updateJobStatus(
                job.id,
                "Rejected"
              )
            }
          >
            Reject
          </button>

        )}

      </div>

    </div>
  );
};

export default JobCard;