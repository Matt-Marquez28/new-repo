import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownButton,
  Modal,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import Footer from "../shared-ui/Footer";
import { useToast } from "../../contexts/toast.context";

const JobVacancyVerificationDetails = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const { jobVacancyId } = useParams();
  const [jobVacancy, setJobVacancy] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const primaryColor = "#1a4798";
  const secondaryColor = "#f8f9fa";

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
        { withCredentials: true }
      );

      triggerToast(
        res?.data?.message || "Job vacancy approved successfully!",
        "success"
      );

      handleCloseApproveModal();
      getSingleJobVacancy();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to approve job vacancy";

      triggerToast(errorMessage, "danger");
    }
  };

  const handleConfirmDecline = async () => {
    try {
      const res = await axios.patch(
        `${JOB_VACANCY_API_END_POINT}/decline-job-vacancy/${jobVacancyId}`,
        { reason: declineReason },
        { withCredentials: true }
      );
      triggerToast(res?.data?.message || "Job vacancy declined!", "warning");
      handleCloseDeclineModal();
      getSingleJobVacancy();
    } catch (error) {
      triggerToast(
        error?.response?.data?.message || "Failed to decline job vacancy",
        "danger"
      );
      console.log(error);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <span className="fw-semibold text-secondary">
            <Badge bg="light" className="text-warning fs-6">
              <i className="bi bi-hourglass-split me-2"></i> Pending
            </Badge>
          </span>
        );
      case "approved":
        return (
          <span className="fw-semibold text-secondary">
            <Badge bg="light" className="text-success fs-6">
              <i className="bi bi-check-circle-fill me-2"></i> Approved
            </Badge>
          </span>
        );
      case "declined":
        return (
          <span className="fw-semibold">
            <Badge bg="light" className="text-danger fs-6">
              <i className="bi bi-x-circle-fill me-2"></i> Declined
            </Badge>
          </span>
        );
      default:
        return (
          <span className="fw-semibold">
            <Badge bg="light" className="text-secondary fs-6">
              <i className="bi bi-question-circle-fill me-2"></i> Unknown
            </Badge>
          </span>
        );
    }
  };

  // Helper component for consistent info display
  const InfoItem = ({ label, value, icon }) => (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div className="bg-white p-2 rounded border">
        <i className={`bi bi-${icon} fs-5`} style={{ color: "#1a4798" }}></i>
      </div>
      <div>
        <div className="fw-semibold small text-muted">{label}</div>
        <div className="small">{value || "-"}</div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </button>
        <div>{jobVacancy && getStatus(jobVacancy.publicationStatus)}</div>

        <div className="d-flex align-items-center gap-3">
          <DropdownButton
            variant="primary"
            title={
              <>
                <i className="bi bi-hand-index-thumb-fill me-2"></i> Actions
              </>
            }
            id="dropdown-more-actions"
            style={{ borderColor: primaryColor }}
          >
            <Dropdown.Item
              onClick={handleShowApproveModal}
              className="text-success"
            >
              <i className="bi bi-check-circle-fill me-2"></i> Approve
            </Dropdown.Item>

            <Dropdown.Item
              onClick={handleShowDeclineModal}
              className="text-danger"
            >
              <i className="bi bi-x-circle-fill me-2"></i> Decline
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>

      {/* Modal for approving */}
      <Modal show={showApproveModal} onHide={handleCloseApproveModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: secondaryColor }}>
          <Modal.Title style={{ color: primaryColor }}>
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            Approve Job Vacancy
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this job vacancy?</p>
          {jobVacancy && (
            <div className="alert alert-light">
              <strong>Job Title:</strong> {jobVacancy.jobTitle}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseApproveModal}>
            <i className="bi bi-x-circle me-2"></i> Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmApproval}
            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
          >
            <i className="bi bi-check-circle me-2"></i> Confirm Approval
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for declining */}
      <Modal show={showDeclineModal} onHide={handleCloseDeclineModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: secondaryColor }}>
          <Modal.Title style={{ color: primaryColor }}>
            <i className="bi bi-x-circle-fill text-danger me-2"></i>
            Decline Job Vacancy
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {jobVacancy && (
            <div className="alert alert-light mb-3">
              <strong>Job Title:</strong> {jobVacancy.jobTitle}
            </div>
          )}
          <p>Please provide a reason for declining this job vacancy:</p>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter reason for declining..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDeclineModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDecline}
            disabled={!declineReason.trim()}
          >
            <i className="bi bi-x-circle me-2"></i> Confirm Decline
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Job Vacancy Details */}
      {jobVacancy && (
        <div className="card shadow-sm mb-4">
          <div
            className="card-header text-white text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-info-circle me-2"></i>
              <h5 className="m-0">Job Vacancy Details</h5>
            </div>
          </div>

          <div className="card-body p-4">
            <div className="row g-4">
              {/* Left Column */}
              <div className="col-md-6">
                {/* Job Information */}
                <div className="card p-3 mb-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-suitcase-lg-fill"></i>
                    Job Information
                  </h5>
                  <InfoItem
                    label="Job Title"
                    value={jobVacancy.jobTitle}
                    icon="briefcase-fill"
                  />
                  <InfoItem
                    label="Employment Type"
                    value={jobVacancy.employmentType}
                    icon="person-workspace"
                  />
                  <InfoItem
                    label="Work Location"
                    value={jobVacancy.workLocation}
                    icon="geo-alt-fill"
                  />
                  <InfoItem
                    label="Vacancies"
                    value={jobVacancy.vacancies}
                    icon="people-fill"
                  />
                  <InfoItem
                    label="Industry"
                    value={jobVacancy.industry}
                    icon="building-fill"
                  />
                </div>

                {/* Salary Information */}
                <div className="card p-3 mb-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-wallet-fill"></i>
                    Salary Information
                  </h5>
                  <InfoItem
                    label="Salary Type"
                    value={jobVacancy.salaryType}
                    icon="cash-stack"
                  />
                  <InfoItem
                    label="Minimum Salary"
                    value={`$${jobVacancy.salaryMin?.toLocaleString()}`}
                    icon="currency-dollar"
                  />
                  <InfoItem
                    label="Maximum Salary"
                    value={`$${jobVacancy.salaryMax?.toLocaleString()}`}
                    icon="currency-exchange"
                  />
                </div>

                {/* Additional Information */}
                <div className="card p-3">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-info-circle-fill"></i>
                    Additional Information
                  </h5>
                  <InfoItem
                    label="Application Deadline"
                    value={formatDate(jobVacancy.applicationDeadline)}
                    icon="calendar-fill"
                  />
                  <InfoItem
                    label="Interview Process"
                    value={jobVacancy.interviewProcess}
                    icon="list-check"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                {/* Job Description */}
                <div className="card mb-4 p-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-file-text-fill"></i>
                    Job Description
                  </h5>
                  <p className="mb-0 text-secondary small">
                    {jobVacancy.description || "No description provided."}
                  </p>
                </div>

                {/* Required Qualifications */}
                <div className="card mb-4 p-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-list-check"></i>
                    Required Qualifications
                  </h5>
                  <ul className="list-unstyled">
                    {jobVacancy.requiredQualifications?.map(
                      (qualification, index) => (
                        <li key={index} className="mb-2">
                          <div className="d-flex align-items-start">
                            <i
                              className="bi bi-check-circle-fill mt-1 me-2"
                              style={{ color: primaryColor }}
                            ></i>
                            <span className="small">{qualification}</span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Responsibilities */}
                <div className="card mb-4 p-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-card-checklist"></i>
                    Responsibilities
                  </h5>
                  <ul className="list-unstyled">
                    {jobVacancy.responsibilities?.map(
                      (responsibility, index) => (
                        <li key={index} className="mb-2">
                          <div className="d-flex align-items-start">
                            <i
                              className="bi bi-check-circle-fill mt-1 me-2"
                              style={{ color: primaryColor }}
                            ></i>
                            <span className="small">{responsibility}</span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Skills Required */}
                <div className="card p-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: primaryColor }}
                  >
                    <i className="bi bi-tools"></i>
                    Skills Required
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {jobVacancy.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="badge"
                        style={{
                          backgroundColor: "rgba(26, 71, 152, 0.1)",
                          color: primaryColor,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
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
