import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownButton, Modal, Button } from "react-bootstrap";
import Footer from "../shared-ui/Footer";

const JobVacancyVerificationDetails = () => {
  const navigate = useNavigate();
  const { jobVacancyId } = useParams();
  const [jobVacancy, setJobVacancy] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Handle closing the modals
  const handleCloseApproveModal = () => setShowApproveModal(false);
  const handleCloseDeclineModal = () => setShowDeclineModal(false);

  useEffect(() => {
    getSingleJobVacancy();
  }, []);

  const getSingleJobVacancy = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-single-job-vacancy/${jobVacancyId}`
      );
      setJobVacancy(res.data.jobVacancy);
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowApproveModal = () => setShowApproveModal(true);
  const handleShowDeclineModal = () => setShowDeclineModal(true);

  const handleConfirmApproval = async () => {
    try {
      const res = await axios.patch(
        `${JOB_VACANCY_API_END_POINT}/approve-job-vacancy/${jobVacancyId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(`Approval action confirmed for job vacancy ${jobVacancyId}`);
      handleCloseApproveModal();
      getSingleJobVacancy(); // Refresh the job vacancy details
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmDecline = async () => {
    try {
      await axios.patch(
        `${JOB_VACANCY_API_END_POINT}/decline-job-vacancy/${jobVacancyId}`,
        { reason: declineReason },
        { withCredentials: true }
      );
      console.log(
        `Decline action confirmed for job vacancy ${jobVacancyId} with reason: ${declineReason}`
      );
      handleCloseDeclineModal();
      getSingleJobVacancy(); // Refresh the job vacancy details
    } catch (error) {
      console.log(error);
    }
  };

  // format date
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-light text-warning fs-6">
              <i className="bi bi-hourglass-split"></i> Pending
            </span>
          </span>
        );
      case "approved":
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-light text-success fs-6">
              <i className="bi bi-check-circle-fill"></i> Approved
            </span>
          </span>
        );
      case "declined":
        return (
          <span className="fw-semibold">
            <span className="badge bg-light text-danger fs-6">
              <i className="bi bi-x-circle-fill"></i> Declined
            </span>
          </span>
        );
      default:
        return (
          <span className="fw-semibold">
            <span className="badge bg-light text-secondary fs-6">
              <i className="bi bi-question-circle-fill"></i> Unknown
            </span>
          </span>
        );
    }
  };

  return (
    <div className="container">
      <div className="d-flex my-2 justify-content-between">
        <div>
          <button
            type="button"
            className="btn btn-light text-dark"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-90deg-left"></i> Back
          </button>
        </div>
        {getStatus(jobVacancy?.publicationStatus)}
        <DropdownButton
          variant="primary"
          title={
            <>
              <i className="bi bi-hand-index-thumb-fill"></i> More Actions
            </>
          }
          id="dropdown-more-actions"
        >
          <Dropdown.Item onClick={handleShowApproveModal}>
            <i className="bi bi-check-circle-fill text-success"></i> Approve
          </Dropdown.Item>

          <Dropdown.Item onClick={handleShowDeclineModal}>
            <i className="bi bi-x-circle-fill text-danger"></i> Decline
          </Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Modal for approving */}
      <Modal show={showApproveModal} onHide={handleCloseApproveModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-check-circle-fill text-success fs-4"></i>{" "}
            Approve this Job Vacancy?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this job vacancy?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApproveModal}>
            <i className="bi bi-file-earmark-x"></i> Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmApproval}>
            <i className="bi bi-file-earmark-check"></i> Approve
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for declining */}
      <Modal show={showDeclineModal} onHide={handleCloseDeclineModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-x-circle-fill text-danger fs-4"></i> Reason for
            Declining
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for declining:</p>
          <textarea
            className="form-control"
            rows="3"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeclineModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDecline}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Job Vacancy Details */}
      {jobVacancy && (
        <div className="card shadow-sm">
          <span className="card-header bg-primary text-light text-center">
            <i className="bi bi-info-circle"></i> Job Vacancy Details
          </span>
          <div className="card-body">
            <div className="row align-items-center my-3">
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
              <div className="col-auto">
                <h5 className="position-relative text-primary">
                  <i className="bi bi-suitcase-lg-fill"></i> Job Detail
                </h5>
              </div>
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
            </div>
            <div className="row">
              {/* Job Title */}
              <div className="col-md-6 mb-3">
                <label htmlFor="jobTitle">Job Title:</label>
                <input
                  name="jobTitle"
                  type="text"
                  value={jobVacancy.jobTitle}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Employment Type */}
              <div className="col-md-6 mb-3">
                <label htmlFor="employmentType">Employment Type:</label>
                <input
                  name="employmentType"
                  type="text"
                  value={jobVacancy.employmentType}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Work Location */}
              <div className="col-md-6 mb-3">
                <label htmlFor="workLocation">Work Location:</label>
                <input
                  name="workLocation"
                  type="text"
                  value={jobVacancy.workLocation}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Number of Vacancies */}
              <div className="col-md-6 mb-3">
                <label htmlFor="vacancies">No. of Vacancies:</label>
                <input
                  name="vacancies"
                  type="number"
                  value={jobVacancy.vacancies}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Industry */}
              <div className="col-md-6 mb-3">
                <label htmlFor="industry">Industry:</label>
                <input
                  name="industry"
                  type="text"
                  value={jobVacancy.industry}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description">Job Description:</label>
                <textarea
                  name="description"
                  rows="3"
                  value={jobVacancy.description}
                  className="form-control"
                  disabled
                />
              </div>
            </div>

            <div className="row align-items-center my-3">
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
              <div className="col-auto">
                <h5 className="position-relative text-primary">
                  <i className="bi bi-wallet-fill"></i> Salary Field
                </h5>
              </div>
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
            </div>

            {/* Salary Fields */}

            {/* Salary Type */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="salaryType">Salary Type:</label>
                <input
                  name="salaryType"
                  type="text"
                  value={jobVacancy.salaryType}
                  className="form-control"
                  disabled
                />
              </div>
            </div>

            {/* Minimum Salary */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="salaryMin">Minimum Salary:</label>
                <input
                  name="salaryMin"
                  type="number"
                  value={jobVacancy.salaryMin}
                  className="form-control"
                  disabled
                />
              </div>
            </div>

            {/* Maximum Salary */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="salaryMax">Maximum Salary:</label>
                <input
                  name="salaryMax"
                  type="number"
                  value={jobVacancy.salaryMax}
                  className="form-control"
                  disabled
                />
              </div>
            </div>

            <div className="row align-items-center my-3">
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
              <div className="col-auto">
                <h5 className="position-relative text-primary">
                  <i className="bi bi-wallet-fill"></i> Job Specification
                </h5>
              </div>
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
            </div>

            {/* Required Qualifications */}
            <div className="mb-3">
              <label>Required Qualifications:</label>
              {jobVacancy.requiredQualifications.map((qualification, index) => (
                <div key={index} className="input-group mb-2">
                  <textarea
                    name={`requiredQualifications[${index}]`}
                    rows="1"
                    value={qualification}
                    className="form-control"
                    disabled
                  />
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="mb-3">
              <label>Responsibilities:</label>
              {jobVacancy.responsibilities.map((responsibility, index) => (
                <div key={index} className="input-group mb-2">
                  <textarea
                    name={`responsibilities[${index}]`}
                    rows="1"
                    value={responsibility}
                    className="form-control"
                    disabled
                  />
                </div>
              ))}
            </div>

            {/* Skills Required */}
            <div className="mb-3">
              <label>Skills Required:</label>
              {jobVacancy.skillsRequired.map((skill, index) => (
                <div key={index} className="input-group mb-2">
                  <textarea
                    name={`skillsRequired[${index}]`}
                    rows="1"
                    value={skill}
                    className="form-control"
                    disabled
                  />
                </div>
              ))}
            </div>

            <div className="row align-items-center my-3">
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
              <div className="col-auto">
                <h5 className="position-relative text-primary">
                  <i className="bi bi-suitcase-lg-fill"></i> Additional Info
                </h5>
              </div>
              <div className="col">
                <hr className="border-2 border-primary" />
              </div>
            </div>

            <div className="row">
              {/* Application Deadline */}
              <div className="col-md-6 mb-3">
                <label htmlFor="applicationDeadline">
                  Application Deadline:
                </label>
                <input
                  name="applicationDeadline"
                  type="date"
                  value={formatDate(jobVacancy.applicationDeadline)}
                  className="form-control"
                  disabled
                />
              </div>

              {/* Interview Process */}
              <div className="col-md-6 mb-3">
                <label htmlFor="interviewProcess">Interview Process:</label>
                <input
                  name="interviewProcess"
                  type="text"
                  value={jobVacancy.interviewProcess}
                  className="form-control"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default JobVacancyVerificationDetails;
