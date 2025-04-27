import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import "./timeline.css";

const WorkExperience = () => {
  const triggerToast = useToast();
  const [isSubmitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    keyResponsibilities: [""],
    achievements_and_contributions: [""],
    skills_and_tools_used: [""],
    proofOfWorkExperienceDocuments: [],
  });

  const [workExperiences, setWorkExperiences] = useState([]);
  const [expandedWorkExperience, setExpandedWorkExperience] = useState({});

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );
      setWorkExperiences(res?.data?.jobSeekerData?.workExperience);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleWorkExperienceDetails = (index) => {
    setExpandedWorkExperience((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const handleAddField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const handleRemoveField = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      proofOfWorkExperienceDocuments: files,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("jobTitle", formData.jobTitle);
    formDataToSend.append("companyName", formData.companyName);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("currentlyWorking", formData.currentlyWorking);

    if (Array.isArray(formData.keyResponsibilities)) {
      formDataToSend.append(
        "keyResponsibilities",
        formData.keyResponsibilities
          .filter((responsibility) => responsibility.trim() !== "")
          .join(",")
      );
    }

    if (Array.isArray(formData.achievements_and_contributions)) {
      formDataToSend.append(
        "achievements_and_contributions",
        formData.achievements_and_contributions
          .filter((achievement) => achievement.trim() !== "")
          .join(",")
      );
    }

    if (Array.isArray(formData.skills_and_tools_used)) {
      formDataToSend.append(
        "skills_and_tools_used",
        formData.skills_and_tools_used
          .filter((skill) => skill.trim() !== "")
          .join(",")
      );
    }

    if (formData.proofOfWorkExperienceDocuments.length > 0) {
      formData.proofOfWorkExperienceDocuments.forEach((file) => {
        formDataToSend.append("proofOfWorkExperienceDocuments", file);
      });
    }

    try {
      setSubmitting(true);
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/add-work-experience`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      getJobSeekerData();
      triggerToast(res?.data?.message, "success");
      handleClose();
    } catch (error) {
      console.error("Error updating work experience:", error);
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkExperience = async (index) => {
    try {
      // Create a copy of the work experiences array and remove the item at the specified index
      const updatedWorkExperiences = [...workExperiences];
      updatedWorkExperiences.splice(index, 1);

      // Update the state
      setWorkExperiences(updatedWorkExperiences);

      // Send the updated array to the backend
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-work-experiences`,
        { workExperiences: updatedWorkExperiences },
        { withCredentials: true }
      );

      // Show a success toast
      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      console.error("Error deleting work experience:", error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center my-3">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#1a4798",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <i className="bi bi-mortarboard-fill text-white"></i>
          </div>
          <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
            Work Experience
          </h5>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
            onClick={handleShow}
          >
            <i className="bi bi-plus-lg"></i> Add Work
          </button>
        </div>
      </div>

      <section className="bg-light p-3 rounded border">
        <div className="position-relative">
          <div
            className="position-absolute top-0 start-0 h-100"
            style={{
              width: "2px",
              backgroundColor: "#1a4798",
              marginLeft: "5px",
            }}
          ></div>

          {workExperiences.map((experience, index) => (
            <div className="position-relative mb-4" key={index}>
              <div
                className="position-absolute top-0 start-0 translate-middle rounded-circle"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#1a4798",
                  border: "2px solid white",
                  boxShadow: "0 0 0 1px #1a4798",
                  marginLeft: "5px",
                }}
              ></div>

              <div className="ms-4 ps-2">
                <div className="bg-white p-3 rounded border">
                  <h6 className="mb-1 fw-bold">{experience?.jobTitle}</h6>
                  <p className="text-muted small mb-2">
                    {new Date(experience?.startDate).toLocaleDateString(
                      "default",
                      {
                        year: "numeric",
                      }
                    )}{" "}
                    • {experience?.companyName}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => toggleWorkExperienceDetails(index)}
                      style={{
                        borderColor: "#1a4798",
                        color: "#1a4798",
                      }}
                    >
                      <i
                        className={`bi bi-chevron-${
                          expandedWorkExperience[index] ? "up" : "down"
                        } me-1`}
                      ></i>
                      {expandedWorkExperience[index]
                        ? "Less Details"
                        : "More Details"}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => handleDeleteWorkExperience(index)}
                      style={{
                        borderColor: "#dc3545",
                        color: "#dc3545",
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {expandedWorkExperience[index] && (
                    <div className="mt-3">
                      {experience?.keyResponsibilities?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-list-task text-primary"></i>
                            Responsibilities
                          </h6>
                          <ul className="list-unstyled">
                            {experience.keyResponsibilities.map(
                              (responsibility, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <span className="small">
                                    {responsibility}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {experience?.achievements_and_contributions?.length >
                        0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-trophy-fill text-warning"></i>
                            Achievements & Contributions
                          </h6>
                          <ul className="list-unstyled">
                            {experience.achievements_and_contributions.map(
                              (achievement, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <span className="small">{achievement}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {experience?.skills_and_tools_used?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-tools text-success"></i>
                            Skills & Tools Used
                          </h6>
                          <ul className="list-unstyled">
                            {experience.skills_and_tools_used.map(
                              (skill, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <span className="small">{skill}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Form */}
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header
          className="text-white"
          style={{ backgroundColor: "#1a4798" }}
          closeButton
        >
          <Modal.Title>
            <i className="bi bi-suitcase-lg-fill"></i> Work Experience Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label>Job Title:</label>
                <input
                  type="text"
                  className="form-control"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="Enter job title"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Company Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Location:</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter work location"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Start Date:</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label>End Date:</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.currentlyWorking}
                  required={!formData.currentlyWorking}
                />
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="currentlyWorking"
                    name="currentlyWorking"
                    checked={formData.currentlyWorking}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="currentlyWorking"
                  >
                    I currently work here
                  </label>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <label>Key Responsibilities:</label>
                {formData.keyResponsibilities.map((responsibility, index) => (
                  <div key={index} className="input-group mb-2">
                    <textarea
                      className="form-control"
                      value={responsibility}
                      onChange={(e) =>
                        handleArrayChange(
                          "keyResponsibilities",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Enter responsibility"
                      rows="3"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() =>
                        handleRemoveField("keyResponsibilities", index)
                      }
                      disabled={formData.keyResponsibilities.length <= 1}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => handleAddField("keyResponsibilities")}
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="col-md-4 mb-3">
                <label>Achievements and Contributions:</label>
                {formData.achievements_and_contributions.map(
                  (achievement, index) => (
                    <div key={index} className="input-group mb-2">
                      <textarea
                        className="form-control"
                        value={achievement}
                        onChange={(e) =>
                          handleArrayChange(
                            "achievements_and_contributions",
                            index,
                            e.target.value
                          )
                        }
                        placeholder="Enter achievement"
                        rows="3"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() =>
                          handleRemoveField(
                            "achievements_and_contributions",
                            index
                          )
                        }
                        disabled={
                          formData.achievements_and_contributions.length <= 1
                        }
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )
                )}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() =>
                    handleAddField("achievements_and_contributions")
                  }
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="col-md-4 mb-3">
                <label>Skills and Tools Used:</label>
                {formData.skills_and_tools_used.map((skill, index) => (
                  <div key={index} className="input-group mb-2">
                    <textarea
                      className="form-control"
                      value={skill}
                      onChange={(e) =>
                        handleArrayChange(
                          "skills_and_tools_used",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Enter skill or tool"
                      rows="3"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() =>
                        handleRemoveField("skills_and_tools_used", index)
                      }
                      disabled={formData.skills_and_tools_used.length <= 1}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => handleAddField("skills_and_tools_used")}
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="row mt-4">
                <div className="col-md-6 mb-2">
                  <label htmlFor="proofOfWorkExperienceDocuments">
                    Proof of Work Experience Documents:
                  </label>
                  <input
                    id="proofOfWorkExperienceDocuments"
                    name="proofOfWorkExperienceDocuments"
                    type="file"
                    accept="image/jpeg, image/png, application/pdf"
                    className="form-control"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <h6 className="fw-normal">
                    Proof of Work Experience Documents:
                  </h6>
                  <ul className=" text-info">
                    <li>Certificate of Employment (COE)</li>
                    <li>Pay Slips (previous employer)</li>
                    <li>Employment Contracts</li>
                    <li>Performance Appraisals</li>
                    <li>Recommendation or Reference Letters</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
          <button
            type="button"
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving Please Wait...
              </>
            ) : (
              <>
                <i className="bi bi-floppy"></i> Save Changes
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkExperience;
