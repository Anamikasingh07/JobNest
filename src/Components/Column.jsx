import JobCard from "./Jobcard";
import "./Column.css";

const Column = ({
  title,
  jobs,
  updateJobStatus
}) => {

  let columnClass = "column";

  if (title === "Applied") {
    columnClass += " applied-column";
  }

  else if (title === "Interview") {
    columnClass += " interview-column";
  }

  else if (title === "Rejected") {
    columnClass += " rejected-column";
  }

  return (

    <div className={columnClass}>

      <div className="column-header">

        <h3>{title}</h3>

        <span className="job-count">
          {jobs.length}
        </span>

      </div>

      {jobs.map((job) => (

        <JobCard
          key={job._id}
          job={job}
          updateJobStatus={updateJobStatus}
        />

      ))}

    </div>
  );
};

export default Column;