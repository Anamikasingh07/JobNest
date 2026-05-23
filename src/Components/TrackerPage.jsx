import Column from "./Column";
import "./TrackerPage.css";

const TrackerPage = ({
  jobs,
  updateJobStatus
}) => {

  return (

    <div className="tracker-page">

      <div className="tracker-header">

        <h2>Application Tracker</h2>

        <p>
          Track your applications here
        </p>

      </div>

      <div className="tracker-columns">

        <Column
          title="Applied"
          jobs={
            jobs.filter(
              (job) => job.status === "Applied"
            )
          }
          updateJobStatus={updateJobStatus}
        />

        <Column
          title="Interview"
          jobs={
            jobs.filter(
              (job) => job.status === "Interview"
            )
          }
          updateJobStatus={updateJobStatus}
        />

        <Column
          title="Rejected"
          jobs={
            jobs.filter(
              (job) => job.status === "Rejected"
            )
          }
          updateJobStatus={updateJobStatus}
        />

      </div>

    </div>
  );
};

export default TrackerPage;