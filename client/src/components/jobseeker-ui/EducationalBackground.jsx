import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useUser } from "../../contexts/user.context";

const EducationalBackground = () => {
  const { setUser } = useUser();
  const triggerToast = useToast();
  const [isSubmitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    degree_or_qualifications: "",
    fieldOfStudy: "",
    institutionName: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyStudying: false,
    achievements: [""],
    relevantCoursework: [""],
    certifications: [""],
    proofOfEducationDocuments: [],
  });

  const [educationalBackgrounds, setEducationalBackgrounds] = useState([]);
  const [expandedEducation, setExpandedEducation] = useState({});

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );
      setEducationalBackgrounds(
        res?.data?.jobSeekerData?.educationalBackground
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleEducationDetails = (index) => {
    setExpandedEducation((prev) => ({
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
      proofOfEducationDocuments: files,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append(
      "degree_or_qualifications",
      formData.degree_or_qualifications
    );
    formDataToSend.append("fieldOfStudy", formData.fieldOfStudy);
    formDataToSend.append("institutionName", formData.institutionName);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("currentlyStudying", formData.currentlyStudying);

    formDataToSend.append(
      "achievements",
      formData.achievements
        .filter((achievement) => achievement.trim() !== "")
        .join(",")
    );
    formDataToSend.append(
      "relevantCoursework",
      formData.relevantCoursework
        .filter((course) => course.trim() !== "")
        .join(",")
    );
    formDataToSend.append(
      "certifications",
      formData.certifications
        .filter((certification) => certification.trim() !== "")
        .join(",")
    );

    if (formData.proofOfEducationDocuments.length > 0) {
      formData.proofOfEducationDocuments.forEach((file) => {
        formDataToSend.append("proofOfEducationDocuments", file);
      });
    }

    try {
      setSubmitting(true);
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/add-educational-background`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      getJobSeekerData();
      setUser((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          educationalBackground: res.data.educationalBackground,
        },
      }));
      triggerToast(res?.data?.message, "primary");
      handleClose();
    } catch (error) {
      console.error("Error updating educational background:", error);
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEducation = async (index) => {
    try {
      const updatedEducationalBackgrounds = [...educationalBackgrounds];
      updatedEducationalBackgrounds.splice(index, 1);

      setEducationalBackgrounds(updatedEducationalBackgrounds);

      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-educational-backgrounds`,
        { educationalBackgrounds: updatedEducationalBackgrounds },
        { withCredentials: true }
      );

      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      console.error("Error deleting educational background:", error);
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
            Educational Background
          </h5>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
            onClick={handleShow}
          >
            <i className="bi bi-plus-lg"></i> Add Education
          </button>
        </div>
      </div>
      <section className="bg-light p-3 rounded border">
        <h5
          className="d-flex align-items-center gap-2 mb-3"
          style={{ color: "#1a4798" }}
        >
          <i className="bi bi-mortarboard-fill"></i>
          Education
        </h5>

        <div className="position-relative">
          <div
            className="position-absolute top-0 start-0 h-100"
            style={{
              width: "2px",
              backgroundColor: "#1a4798",
              marginLeft: "5px",
            }}
          ></div>

          {educationalBackgrounds.map((education, index) => (
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
                  <h6 className="mb-1 fw-bold">
                    {education?.degree_or_qualifications}
                  </h6>
                  <p className="text-muted small mb-2">
                    {new Date(education?.startDate).toLocaleDateString(
                      "default",
                      {
                        year: "numeric",
                      }
                    )}{" "}
                    • {education?.institutionName}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => toggleEducationDetails(index)}
                      style={{
                        borderColor: "#1a4798",
                        color: "#1a4798",
                      }}
                    >
                      <i
                        className={`bi bi-chevron-${
                          expandedEducation[index] ? "up" : "down"
                        } me-1`}
                      ></i>
                      {expandedEducation[index]
                        ? "Less Details"
                        : "More Details"}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => handleDeleteEducation(index)}
                      style={{
                        borderColor: "#dc3545",
                        color: "#dc3545",
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {expandedEducation[index] && (
                    <div className="mt-3">
                      {education?.achievements?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-trophy-fill text-warning"></i>
                            Achievements
                          </h6>
                          <ul className="list-unstyled">
                            {education.achievements.map((achievement, i) => (
                              <li key={i} className="d-flex mb-2">
                                <span className="me-2">•</span>
                                <span className="small">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {education?.relevantCoursework?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-journal-bookmark-fill text-primary"></i>
                            Relevant Coursework
                          </h6>
                          <ul className="list-unstyled">
                            {education.relevantCoursework.map(
                              (coursework, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <span className="small">{coursework}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {education?.certifications?.length > 0 && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-check-fill text-success"></i>
                            Certifications
                          </h6>
                          <ul className="list-unstyled">
                            {education.certifications.map(
                              (certification, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <span className="small">{certification}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {education?.proofOfEducationDocuments?.length > 0 && (
                        <div>
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-arrow-down-fill text-info"></i>
                            Documents
                          </h6>
                          <ul className="list-unstyled">
                            {education.proofOfEducationDocuments.map(
                              (doc, i) => (
                                <li key={i} className="d-flex mb-2">
                                  <span className="me-2">•</span>
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="small text-decoration-none"
                                  >
                                    {doc.originalName}
                                  </a>
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
          className=" text-white"
          style={{ backgroundColor: "#1a4798" }}
          closeButton
        >
          <Modal.Title>
            <i className="bi bi-mortarboard-fill me-2"></i> Educational
            Background Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label>Degree or Qualification:</label>
                <input
                  type="text"
                  className="form-control"
                  name="degree_or_qualifications"
                  value={formData.degree_or_qualifications}
                  onChange={handleChange}
                  placeholder="Enter degree or qualification"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Field of Study:</label>
                <input
                  type="text"
                  className="form-control"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="Enter field of study"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Institution Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="Enter institution name"
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
                  placeholder="Enter institution location"
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
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
              <div className="col-md-4 mb-3">
                <label>End Date:</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  disabled={formData.currentlyStudying}
                  required={!formData.currentlyStudying}
                />
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="currentlyStudying"
                    name="currentlyStudying"
                    checked={formData.currentlyStudying}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="currentlyStudying"
                  >
                    I am currently studying here
                  </label>
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <label>Achievements and Honors:</label>
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="input-group mb-2">
                    <textarea
                      className="form-control"
                      value={achievement}
                      onChange={(e) =>
                        handleArrayChange("achievements", index, e.target.value)
                      }
                      placeholder="Enter achievement"
                      rows="3"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => handleRemoveField("achievements", index)}
                      disabled={formData.achievements.length <= 1}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => handleAddField("achievements")}
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="col-md-4 mb-3">
                <label>Relevant Coursework:</label>
                {formData.relevantCoursework.map((course, index) => (
                  <div key={index} className="input-group mb-2">
                    <textarea
                      className="form-control"
                      value={course}
                      onChange={(e) =>
                        handleArrayChange(
                          "relevantCoursework",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Enter coursework"
                      rows="3"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() =>
                        handleRemoveField("relevantCoursework", index)
                      }
                      disabled={formData.relevantCoursework.length <= 1}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => handleAddField("relevantCoursework")}
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="col-md-4 mb-3">
                <label>Certifications:</label>
                {formData.certifications.map((certification, index) => (
                  <div key={index} className="input-group mb-2">
                    <textarea
                      className="form-control"
                      value={certification}
                      onChange={(e) =>
                        handleArrayChange(
                          "certifications",
                          index,
                          e.target.value
                        )
                      }
                      placeholder="Enter certification"
                      rows="3"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => handleRemoveField("certifications", index)}
                      disabled={formData.certifications.length <= 1}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => handleAddField("certifications")}
                >
                  <i className="bi bi-plus-circle"></i> Add More
                </button>
              </div>

              <div className="row mt-4">
                <div className="col-md-6 mb-2">
                  <label htmlFor="proofOfEducationDocuments">
                    Proof of Education Documents:
                  </label>
                  <input
                    id="proofOfEducationDocuments"
                    name="proofOfEducationDocuments"
                    type="file"
                    accept="image/jpeg, image/png, application/pdf"
                    className="form-control"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <h6 className="fw-normal">Proof of Education Documents:</h6>
                  <ul className=" text-info">
                    <li>Diploma or Degree Certificate</li>
                    <li>Transcript of Records (TOR)</li>
                    <li>Certificate of Completion</li>
                    <li>Training Certificates</li>
                    <li>Academic Awards</li>
                    <li>Course Completion Certificates</li>
                    <li>Professional Certifications</li>
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
            disabled={isSubmitting}
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

export default EducationalBackground;
