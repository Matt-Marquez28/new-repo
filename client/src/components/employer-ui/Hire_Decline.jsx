import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { useParams } from "react-router-dom";

const Hire_Decline = ({getApplication}) => {
  const { applicationId } = useParams();
  const triggerToast = useToast();
  const [showHireModal, setShowHireModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  const handleHire = async () => {
    try {
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/hire-applicant/${applicationId}`,
        { remarks }
      );
      triggerToast(response?.data?.message, "success");
      getApplication();
      setShowHireModal(false);
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleDecline = async () => {
    try {
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/decline-applicant/${applicationId}`,
        { remarks }
      );
      triggerToast(response.data.message, "success");
      getApplication();
      setShowDeclineModal(false);
    } catch (error) {
      triggerToast(error.response.data.message, "danger");
    }
  };

  return (
    <div className="container">
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle-fill"></i> Keep the language neutral and
        professional, especially for the "Decline" option. Avoid harsh or
        negative phrasing.
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-danger"
          onClick={() => setShowDeclineModal(true)}
        >
          <i className="bi bi-x-circle-fill"></i> Decline
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setShowHireModal(true)}
        >
          <i className="bi bi-check-circle-fill"></i> Hire
        </button>
      </div>

      {/* Hire Modal */}
      <Modal
        show={showHireModal}
        onHide={() => setShowHireModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Hire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to hire this candidate?</p>
          <textarea
            className="form-control"
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHireModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleHire}>
            Hire
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Decline Modal */}
      <Modal
        show={showDeclineModal}
        onHide={() => setShowDeclineModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Decline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to decline this candidate?</p>
          <textarea
            className="form-control"
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeclineModal(false)}
          >
            Close
          </Button>
          <Button variant="danger" onClick={handleDecline}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Hire_Decline;
