import "./ManageJobs.css";
import { useState } from "react";

const ManageJobs = ({
  availableJobs,
  setAvailableJobs
}) => {

  const [formData, setFormData] =
    useState({

      company: "",
      role: "",
      category: "",
      location: ""

    });

  /* ADD JOB */
  const handleAddJob = () => {

    if (
      !formData.company ||
      !formData.role
    ) {
      return;
    }

    const newJob = {

      id: Date.now().toString(),

      ...formData,

      salary: "$100k+",

      type: "Full-time",

      description:
        "New job opportunity."

    };

    setAvailableJobs((prev) => [
      ...prev,
      newJob
    ]);

    setFormData({

      company: "",
      role: "",
      category: "",
      location: ""

    });

  };

  /* DELETE */
  const handleDelete = (id) => {

    setAvailableJobs((prev) =>

      prev.filter(
        (job) => job.id !== id
      )

    );

  };

  return (

    <div className="manage-jobs">

      <h2>Manage Jobs</h2>

      {/* FORM */}
      <div className="job-form">

        <input
          type="text"
          placeholder="Company"

          value={formData.company}

          onChange={(e) =>
            setFormData({

              ...formData,

              company:
                e.target.value

            })
          }
        />

        <input
          type="text"
          placeholder="Role"

          value={formData.role}

          onChange={(e) =>
            setFormData({

              ...formData,

              role:
                e.target.value

            })
          }
        />

        <input
          type="text"
          placeholder="Category"

          value={formData.category}

          onChange={(e) =>
            setFormData({

              ...formData,

              category:
                e.target.value

            })
          }
        />

        <input
          type="text"
          placeholder="Location"

          value={formData.location}

          onChange={(e) =>
            setFormData({

              ...formData,

              location:
                e.target.value

            })
          }
        />

        <button
          onClick={handleAddJob}
        >
          Add Job
        </button>

      </div>

      {/* JOB LIST */}
      <div className="admin-job-grid">

        {availableJobs.map((job) => (

          <div
            className="admin-job-card"
            key={job.id}
          >

            <h3>{job.company}</h3>

            <p>{job.role}</p>

            <span>
              {job.category}
            </span>

            <button
              onClick={() =>
                handleDelete(job.id)
              }
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ManageJobs;