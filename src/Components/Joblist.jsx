import { useState } from "react";
import JobModal from "./JobModal";
import "./Joblist.css";

const Joblist = ({ jobs, onApply }) => {

  const [selectedJob, setSelectedJob] = useState(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");

  // FILTER LOGIC
  const filteredJobs = jobs.filter((job) => {

    const matchesSearch =

      job.company
        .toLowerCase()
        .includes(search.toLowerCase())

      ||

      job.role
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =

      filter === "All"
        ? true
        : job.category === filter;

    return matchesSearch && matchesFilter;
  });

  return (

    <div className="joblist-page">

      {/* SEARCH + FILTER */}
      <div className="job-controls">

        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >

          <option>All</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Design</option>

        </select>

      </div>

      {/* JOB GRID */}
      <div className="job-grid">

        {filteredJobs.map((job) => (

          <div className="job-box" key={job.id}>

            <h3>{job.company}</h3>

            <p>{job.role}</p>

            <span className="job-tag">
              {job.category}
            </span>

            <div className="job-buttons">

              {/* DETAILS */}
              <button
                className="details-btn"
                onClick={() => setSelectedJob(job)}
              >
                Details
              </button>

              {/* APPLY */}
              <button
                className="apply-btn"
                onClick={() => onApply(job)}
              >
                Apply
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* MODAL */}
      {selectedJob && (

        <JobModal
          job={selectedJob}
          closeModal={() => setSelectedJob(null)}
          onApply={onApply}
        />

      )}

    </div>
  );
};

export default Joblist;