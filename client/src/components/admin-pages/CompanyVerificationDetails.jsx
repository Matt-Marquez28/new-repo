import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { Dropdown, DropdownButton, Modal, Button } from "react-bootstrap";
import CompanyInformation from "../admin-ui/CompanyInformation";
import LegalDocuments from "../admin-ui/LegalDocuments";
import { useToast } from "../../contexts/toast.context";
import Footer from "../shared-ui/Footer";
import Accreditation from "../admin-ui/Accreditation";

const CompanyVerificationDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [document, setDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const triggerToast = useToast();

  useEffect(() => {
    getCompanyDocument();
    getCompanyDataById();
  }, []);

  // get company document
  const getCompanyDocument = async () => {
    try {
      // Make a POST request to fetch company documents
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-company-document-by-companyId-admin/${companyId}`
      );

      if (res && res.data) {
        // If the response and data are valid, set the documents in state
        setDocument(res?.data?.documents);
      } else {
        console.log("No documents found.");
      }
    } catch (error) {
      console.error("Error fetching company documents:", error);
      // Handle different types of errors here (e.g., network issues, HTTP status errors)
    }
  };

  const getCompanyDataById = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-company-data-by-id/${companyId}`
      );
      setCompany(res?.data?.companyData);
    } catch (error) {
      console.log(error);
    }
  };

  // State for handling modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Handle opening the modals
  const handleShowVerifyModal = () => setShowVerifyModal(true);
  const handleShowDeclineModal = () => setShowDeclineModal(true);

  // Handle closing the modals
  const handleCloseVerifyModal = () => setShowVerifyModal(false);
  const handleCloseDeclineModal = () => setShowDeclineModal(false);

  // Handle confirm actions
  const handleConfirmVerify = async () => {
    try {
      setIsSubmitting(true);
      const res = await axios.patch(
        `${COMPANY_API_END_POINT}/accredit-company/${companyId}`
      );
      getCompanyDataById();
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
    handleCloseVerifyModal();
  };

  // handle document decline
  const handleConfirmDecline = async () => {
    try {
      setIsSubmitting(true);
      const res = await axios.patch(
        `${COMPANY_API_END_POINT}/decline-company/${companyId}`,
        {
          remarks: declineReason,
        }
      );
      getCompanyDataById();
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
    handleCloseDeclineModal();
  };

  const [activeTab, setActiveTab] = useState("companyInformation");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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
      case "accredited":
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-light text-success fs-6">
              <i className="bi bi-check-circle-fill"></i> Accredited
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
      case "revoked":
        return (
          <span className="fw-semibold">
            <span className="badge bg-light text-secondary fs-6">
              <i className="bi bi-slash-circle-fill"></i> Revoked
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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-light" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-90deg-left"></i> Back
        </button>

        {getStatus(company?.status)}

        <DropdownButton
          variant="primary"
          title={
            <>
              <i className="bi bi-hand-index-thumb-fill"></i> More Actions
            </>
          }
          id="dropdown-more-actions"
        >
          <Dropdown.Item onClick={handleShowVerifyModal}>
            <i className="bi bi-check-circle-fill text-success"></i> Accredit
          </Dropdown.Item>

          <Dropdown.Item onClick={handleShowDeclineModal}>
            <i className="bi bi-x-circle-fill text-danger"></i> Decline
          </Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Modal for verifying */}
      <Modal show={showVerifyModal} onHide={handleCloseVerifyModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-check-circle-fill text-success fs-4"></i>{" "}
            Accredit This Company?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to verify this document?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVerifyModal}>
            <i className="bi bi-file-earmark-x"></i> Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmVerify}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-grow spinner-grow-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-check"></i> Accredit
              </>
            )}
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

      {/* card */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "companyInformation" ? "active" : ""
                }`}
                onClick={() => handleTabClick("companyInformation")}
              >
                <i className="bi bi-building-fill"></i> Company Info
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "legalDocuments" ? "active" : ""
                }`}
                onClick={() => handleTabClick("legalDocuments")}
              >
                <i className="bi bi-file-earmark-check-fill"></i> Legal
                Documents
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "accreditation" ? "active" : ""
                }`}
                onClick={() => handleTabClick("accreditation")}
              >
                <i className="bi bi-file-earmark-check-fill"></i> Proof of
                Accreditation
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === "companyInformation" && (
            <CompanyInformation companyId={document?.companyId} />
          )}
          {activeTab === "legalDocuments" && (
            <LegalDocuments
              companyId={document}
              getCompanyDocument={getCompanyDocument}
            />
          )}
          {activeTab === "accreditation" && (
            <Accreditation companyId={document?.companyId} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyVerificationDetails;
