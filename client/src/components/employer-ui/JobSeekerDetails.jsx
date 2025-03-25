import React, { useState, useEffect } from "react";
import {
  JOB_VACANCY_API_END_POINT,
  JOBSEEKER_API_END_POINT,
} from "../../utils/constants";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/user.context";
import {
  Modal,
  Button,
  ListGroup,
  Card,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";
import Footer from "../shared-ui/Footer";
import ReportButton from "../shared-ui/ReportButton";

const JobSeekerDetails = () => {
  const triggerToast = useToast();
  const { user } = useUser();
  const navigate = useNavigate();
  const { jobSeekerId } = useParams();
  const [jobseekerData, setJobseekerData] = useState(null);
  const [expandedEducation, setExpandedEducation] = useState({});
  const [expandedWorkExperience, setExpandedWorkExperience] = useState({});
  const [loading, setLoading] = useState(false);

  // constants
  const personalInformation = jobseekerData?.personalInformation;
  const specializations =
    jobseekerData?.skillsAndSpecializations?.specializations;
  const coreSkills = jobseekerData?.skillsAndSpecializations?.coreSkills;
  const softSkills = jobseekerData?.skillsAndSpecializations?.softSkills;
  const educationalBackgrounds = jobseekerData?.educationalBackground;
  const workExperiences = jobseekerData?.workExperience;

  useEffect(() => {
    getJobSeekerData();
  }, []);

  // get job seeker data
  const getJobSeekerData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data-by-id/${jobSeekerId}`
      );
      console.log(res?.data?.jobSeeker);
      setJobseekerData(res?.data?.jobSeeker);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Separate toggle functions for each section
  const toggleEducationDetails = (index) => {
    setExpandedEducation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleWorkExperienceDetails = (index) => {
    setExpandedWorkExperience((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [showModal, setShowModal] = useState(false);

  const handleSendInvitation = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectJob = async (job) => {
    try {
      const res = await axios.post(
        `${JOB_VACANCY_API_END_POINT}/send-job-invitation/${jobSeekerId}`,
        { jobVacancyId: job._id },
        {
          withCredentials: true,
        }
      );
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
    setShowModal(false);
  };

  return (
    <Container className="col-md-8">
      {/* Navigation Buttons */}
      <Row className="my-2">
        <Col>
          <Button variant="light" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-90deg-left"></i> Back
          </Button>
        </Col>
        <Col className=" d-flex gap-2 justify-content-end text-end">
          <ReportButton accountId={jobseekerData?.accountId} />
          <Button
            variant="primary"
            className="text-light"
            onClick={handleSendInvitation}
          >
            <i className="bi bi-envelope-paper-fill"></i> Send Invitation
          </Button>
        </Col>
      </Row>

      {/* Job Seeker Details Card */}
      {loading ? (
        <div className="d-flex justify-content-center gap-3 my-3">
          <div className="spinner-grow text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="spinner-grow text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="spinner-grow text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-light text-center">
            <i className="bi bi-info-circle"></i> Job Seeker Details
          </Card.Header>
          <Card.Body>
            <div className="overflow-auto row" style={{ maxHeight: "700px" }}>
              <div className="col-md-4">
                <div className="mb-4 text-center">
                  <img
                    src={personalInformation?.photo}
                    alt="Profile Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                    className="border rounded shadow-sm"
                  />
                  <h5
                    className="my-2 fw-bold"
                    style={{ color: "#555555" }}
                  >{`${personalInformation?.firstName} ${personalInformation?.lastName}`}</h5>
                </div>

                <hr />

                <div className="mb-4">
                  <h5 className="text-primary">Specializations</h5>
                  {specializations?.map((specialization, index) => (
                    <h6 key={index} className="text-secondary small fw-normal">
                      {specialization}
                    </h6>
                  ))}
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">Core Skills</h5>
                  {coreSkills?.map((skill, index) => (
                    <h6 key={index} className="text-secondary fw-normal small">
                      {/* <span className="badge bg-light text-secondary">{skill}</span> */}
                      {skill}
                    </h6>
                  ))}
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">Soft Skills</h5>
                  {softSkills?.map((skill, index) => (
                    <h6 key={index} className="text-secondary fw-normal small">
                      {skill}
                    </h6>
                  ))}
                </div>

                <div className="mb-2">
                  <h5 className="text-primary">Contact Information</h5>
                  <div className="d-flex text-start align-items-center gap-3 mb-3">
                    <div>
                      <i className="bi bi-envelope-fill fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <div className="small fw-semibold text-secondary">
                        Email
                      </div>
                      <div className="text-secondary small">
                        {personalInformation?.emailAddress}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex text-start align-items-center gap-3 mb-3">
                  <div>
                    <i className="bi bi-phone-fill fs-4 text-secondary"></i>
                  </div>
                  <div>
                    <div className="small fw-semibold text-secondary">
                      Mobile No.
                    </div>
                    <div className="text-secondary small">
                      {personalInformation?.mobileNumber}
                    </div>
                  </div>
                </div>
                {/* Educational Background */}
                <section className="py-2">
                  <h5 className="text-primary mb-3">Educational Background</h5>
                  <ul className="timeline">
                    {educationalBackgrounds?.map((education, index) => (
                      <li className="timeline-item mb-3" key={index}>
                        <h5 className="m-0 small">
                          {education?.degree_or_qualifications}
                        </h5>
                        <p className="text-secondary mb-2 m-0 small">
                          {new Date(education?.startDate).toLocaleDateString(
                            "default",
                            { year: "numeric" }
                          )}{" "}
                          - {education?.institutionName}
                        </p>

                        {/* Details Toggle Button */}
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => toggleEducationDetails(index)}
                        >
                          {expandedEducation[index]
                            ? "Hide Details"
                            : "Show Details"}
                        </button>

                        {/* Conditionally Rendered Details */}
                        {expandedEducation[index] && (
                          <>
                            <div className="my-3">
                              <h6 className="m-0 small">Achievements:</h6>
                              {education?.achievements &&
                                education?.achievements.length > 0 && (
                                  <ul className="list-unstyled">
                                    {education?.achievements.map(
                                      (achievement, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {achievement}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0 small">
                                Relevant Course Work:
                              </h6>
                              {education?.relevantCoursework &&
                                education?.relevantCoursework.length > 0 && (
                                  <ul className="list-unstyled">
                                    {education?.relevantCoursework.map(
                                      (coursework, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {coursework}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0csmall">Certifications:</h6>
                              {education?.certifications &&
                                education?.certifications.length > 0 && (
                                  <ul className="list-unstyled">
                                    {education?.certifications.map(
                                      (certification, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {certification}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0 small">Documents:</h6>
                              {education?.proofOfEducationDocuments &&
                                education?.proofOfEducationDocuments.length >
                                  0 && (
                                  <ul className="list-unstyled">
                                    {education?.proofOfEducationDocuments.map(
                                      (doc, i) => (
                                        <li
                                          key={i}
                                          className="text-muted mx-3 small"
                                        >
                                          &#8226;
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none"
                                          >
                                            {" "}
                                            {doc.originalName}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <div className="col-md-8">
                <div className="mb-4">
                  <h5 className="text-primary">About Me</h5>
                  <p className="text-secondary text-justify small">
                    {personalInformation?.aboutMe}
                  </p>
                </div>

                {/* Work Experiences */}
                <section className="py-2">
                  <h5 className="text-primary mb-3">Work Experience</h5>
                  <ul className="timeline">
                    {workExperiences?.map((work, index) => (
                      <li className="timeline-item mb-3" key={index}>
                        <h5 className="m-0 small">{work?.jobTitle}</h5>
                        <p className="text-secondary mb-2 m-0 small">
                          {new Date(work?.startDate).toLocaleDateString(
                            "default",
                            {
                              year: "numeric",
                            }
                          )}{" "}
                          - {work?.companyName}
                        </p>

                        {/* Details Toggle Button */}
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => toggleWorkExperienceDetails(index)}
                        >
                          {expandedWorkExperience[index]
                            ? "Hide Details"
                            : "Show Details"}
                        </button>

                        {/* Conditionally Rendered Details */}
                        {expandedWorkExperience[index] && (
                          <>
                            <div className="my-3">
                              <h6 className="m-0 small">
                                Key Responsibilities:
                              </h6>
                              {work?.keyResponsibilities &&
                                work?.keyResponsibilities.length > 0 && (
                                  <ul className="list-unstyled">
                                    {work?.keyResponsibilities.map(
                                      (responsibility, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {responsibility}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0 small">
                                Achievements & Contributions:
                              </h6>
                              {work?.achievements_and_contributions &&
                                work?.achievements_and_contributions.length >
                                  0 && (
                                  <ul className="list-unstyled">
                                    {work?.achievements_and_contributions.map(
                                      (achievement, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {achievement}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0 small">
                                Skills & Tools Used:
                              </h6>
                              {work?.skills_and_tools_used &&
                                work?.skills_and_tools_used.length > 0 && (
                                  <ul className="list-unstyled">
                                    {work?.skills_and_tools_used.map(
                                      (skills, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226; {skills}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>

                            <div className="my-3">
                              <h6 className="m-0 small">Documents:</h6>
                              {work?.proofOfWorkExperienceDocuments &&
                                work?.proofOfWorkExperienceDocuments.length >
                                  0 && (
                                  <ul className="list-unstyled">
                                    {work?.proofOfWorkExperienceDocuments.map(
                                      (doc, i) => (
                                        <li
                                          key={i}
                                          className="text-secondary mx-3 small"
                                        >
                                          &#8226;
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none"
                                          >
                                            {" "}
                                            {doc.originalName}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered scrollable>
        {/* Modal Header */}
        <Modal.Header closeButton className="bg-primary text-light">
          <Modal.Title>
            <i className="bi bi-briefcase me-2"></i>
            Choose a Job for Your Invitation
          </Modal.Title>
        </Modal.Header>

        {/* Modal Body */}
        <Modal.Body
          style={{ maxHeight: "60vh", overflowY: "auto" }}
          className="p-0"
        >
          {user.companyData.jobVacancies &&
          user.companyData.jobVacancies.length > 0 ? (
            <ListGroup variant="flush">
              {user.companyData.jobVacancies.map((job, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  className="d-flex justify-content-between align-items-center p-3"
                >
                  <span className="fw-semibold" style={{ color: "#555555" }}>
                    {job.jobTitle}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={() => handleSelectJob(job)}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Select
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
              <p className="text-muted mt-2">No job vacancies available.</p>
            </div>
          )}
        </Modal.Body>

        {/* Modal Footer */}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            <i className="bi bi-x-circle me-2"></i>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </Container>
  );
};

export default JobSeekerDetails;
