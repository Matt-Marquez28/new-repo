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
    switch (status) {
      case "pending":
        return (
          <Badge bg="warning" className="fs-6">
            <i className="bi bi-hourglass-split me-2"></i> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge bg="success" className="fs-6">
            <i className="bi bi-check-circle-fill me-2"></i> Approved
          </Badge>
        );
      case "declined":
        return (
          <Badge bg="danger" className="fs-6">
            <i className="bi bi-x-circle-fill me-2"></i> Declined
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="fs-6">
            <i className="bi bi-question-circle-fill me-2"></i> Unknown
          </Badge>
        );
    }
  };

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

        <div className="d-flex align-items-center gap-3">
          {jobVacancy && getStatus(jobVacancy.publicationStatus)}

          <DropdownButton
            variant="outline-primary"
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
        <Card className="shadow-sm mb-4">
          <Card.Header
            className="text-white text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <i className="bi bi-info-circle"></i> Job Vacancy Details
          </Card.Header>
          <Card.Body>
            {/* Basic Information Section */}
            <div className="mb-4">
              <h5
                className="mb-3 d-flex align-items-center"
                style={{ color: primaryColor }}
              >
                <i className="bi bi-suitcase-lg-fill me-2"></i>
                Job Information
              </h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Job Title</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.jobTitle}</p>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Employment Type</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.employmentType}</p>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Work Location</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.workLocation}</p>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Vacancies</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.vacancies}</p>
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Industry</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.industry}</p>
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Job Description</h6>
                    <p className="mb-0">{jobVacancy.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Information Section */}
            <div className="mb-4">
              <h5
                className="mb-3 d-flex align-items-center"
                style={{ color: primaryColor }}
              >
                <i className="bi bi-wallet-fill me-2"></i>
                Salary Information
              </h5>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Salary Type</h6>
                    <p className="mb-0 fw-bold">{jobVacancy.salaryType}</p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Minimum Salary</h6>
                    <p className="mb-0 fw-bold">
                      ${jobVacancy.salaryMin?.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="col-md-4 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Maximum Salary</h6>
                    <p className="mb-0 fw-bold">
                      ${jobVacancy.salaryMax?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Specifications Section */}
            <div className="mb-4">
              <h5
                className="mb-3 d-flex align-items-center"
                style={{ color: primaryColor }}
              >
                <i className="bi bi-list-check me-2"></i>
                Job Specifications
              </h5>

              <div className="mb-4">
                <h6 className="text-muted mb-3">Required Qualifications</h6>
                <ul className="list-group">
                  {jobVacancy.requiredQualifications.map(
                    (qualification, index) => (
                      <li key={index} className="list-group-item">
                        <i className="bi bi-check-circle-fill text-primary me-2"></i>
                        {qualification}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3">Responsibilities</h6>
                <ul className="list-group">
                  {jobVacancy.responsibilities.map((responsibility, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-3">Skills Required</h6>
                <ul className="list-group">
                  {jobVacancy.skillsRequired.map((skill, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-check-circle-fill text-primary me-2"></i>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h5
                className="mb-3 d-flex align-items-center"
                style={{ color: primaryColor }}
              >
                <i className="bi bi-info-circle-fill me-2"></i>
                Additional Information
              </h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Application Deadline</h6>
                    <p className="mb-0 fw-bold">
                      {formatDate(jobVacancy.applicationDeadline)}
                    </p>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted">Interview Process</h6>
                    <p className="mb-0 fw-bold">
                      {jobVacancy.interviewProcess}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      <Footer />
    </div>
  );
};

export default JobVacancyVerificationDetails;
