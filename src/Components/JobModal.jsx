import "./JobModal.css";

const JobModal = ({
  job,
  closeModal,
  onApply
}) => {

  return (

    <div className="modal-overlay">

      <div className="modal">

        {/* CLOSE */}
        <button
          className="close-btn"
          onClick={closeModal}
        >
          ✖
        </button>

        <h2>{job.company}</h2>

        <h3>{job.role}</h3>

        <p>
          This is a great opportunity for
          developers interested in modern
          technologies.
        </p>

        <button
          className="apply-btn"
          onClick={() => {

            onApply(job);
            closeModal();

          }}
        >
          Apply Now
        </button>

      </div>

    </div>
  );
};

export default JobModal;