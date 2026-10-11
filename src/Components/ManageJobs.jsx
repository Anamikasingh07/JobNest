import "./ManageJobs.css";
import { useState } from "react";
import { createJob } from "../services/jobService";
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
 const handleAddJob = async () => {

    if (!formData.company || !formData.role) {

        alert("Fill all required fields");
        return;

    }

    try {

        const token = localStorage.getItem("token");

        const newJob = {

            title: formData.role,
            company: formData.company,
            location: formData.location,
            salary: "$100k+",
            description: formData.category,
            skills: "React"

        };

        const response = await createJob(newJob, token);

        setAvailableJobs(prev => [

            response.job,
            ...prev

        ]);

        setFormData({

            company: "",
            role: "",
            category: "",
            location: ""

        });

        alert("Job Added");

    }

    catch(err){

        console.log(err);

    }

};

  /* DELETE */
  const handleDelete = (id) => {

    setAvailableJobs((prev) =>

      prev.filter(
        (job) => job._id !== id
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
            key={job._id}
          >

            <h3>{job.company}</h3>

            <p>{job.title}</p>

            <span>
              {job.category}
            </span>

            <button
              onClick={() =>
                handleDelete(job._id)
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