import "./Jobcard.css";

const JobCard = ({ job, updateJobStatus }) => {

  const status = job.status || "Applied";
  const priority = job.priority || "Medium";

  return (

    <div className={`job-card ${status.toLowerCase()}-card`}>

      {/* TOP */}
      <div className="job-top">

        <div>

          <h4>{job.company}</h4>

          <p>{job.title}</p>

        </div>

        <span className={`priority ${priority.toLowerCase()}`}>
          {priority}
        </span>

      </div>

      {/* DATE */}
      <div className="job-info">
        📅 Applied: {job.appliedDate || "Today"}
      </div>

      {/* DESCRIPTION */}
      <div className="job-notes">
        📝 {job.description || "No description"}
      </div>

      {/* BUTTONS */}
      <div className="tracker-buttons">

        {status !== "Interview" && (

          <button
            className="interview-btn"
            onClick={() =>
              updateJobStatus(job._id, "Interview")
            }
          >
            Interview
          </button>

        )}

        {status !== "Rejected" && (

          <button
            className="reject-btn"
            onClick={() =>
              updateJobStatus(job._id, "Rejected")
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