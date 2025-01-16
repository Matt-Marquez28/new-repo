import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dropdown, DropdownButton, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";

const JobSeekerVerificationDetails = () => {
  const [document, setDocument] = useState(null);
  const { documentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getJobSeekerDocument();
  }, []);

  const getJobSeekerDocument = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-document/${documentId}`
      );
      console.log(res?.data?.document);
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
  const handleConfirmVerify = () => {
    console.log(`Verify action confirmed for document ${documentId}`);
    handleCloseVerifyModal();
  };

  const handleConfirmDecline = () => {
    console.log(
      `Decline action confirmed for document ${documentId} with reason: ${declineReason}`
    );
    handleCloseDeclineModal();
  };

  // get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "incomplete":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-exclamation-circle text-secondary"></i>{" "}
            Incomplete
          </span>
        );
      case "pending":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-hourglass-split text-warning"></i> Pending
          </span>
        );
      case "verified":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-check-circle-fill text-success"></i> Verified
          </span>
        );
      case "declined":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-x-circle-fill text-danger"></i> Declined
          </span>
        );
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-light" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-90deg-left"></i> Back
        </button>
        <DropdownButton
          variant="light"
          title="More Actions"
          id="dropdown-more-actions"
        >
          <Dropdown.Item onClick={handleShowVerifyModal}>
            <i className="bi bi-check-circle-fill text-success"></i> Verify
          </Dropdown.Item>

          <Dropdown.Item onClick={handleShowDeclineModal}>
            <i className="bi bi-x-circle-fill text-danger"></i> Decline
          </Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Render job seeker documents details here */}
      <div className="verification-details">
        <h5>Document ID: {documentId}</h5>
        {/* More details about the document can be displayed here */}
        <p>Valid ID 1: [ID1]</p>
        <p>Original Name: [Original Name 1]</p>
        <p>Status: Pending</p>
        <p>Remarks: [Some remarks]</p>
      </div>

      {/* Modal for verifying */}
      <Modal show={showVerifyModal} onHide={handleCloseVerifyModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-check-circle-fill text-success fs-4"></i> Verify
            This?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to verify this document?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseVerifyModal}>
            <i className="bi bi-file-earmark-x"></i> Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmVerify}>
            <i className="bi bi-file-earmark-check"></i> Verify
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
    </div>
  );
};

export default JobSeekerVerificationDetails;
