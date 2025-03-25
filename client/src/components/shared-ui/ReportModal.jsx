import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ReportModal = ({ show, handleClose, handleSubmit, accountId }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");

  const reasons = [
    "Harassment",
    "Scam/Fraud",
    "Inappropriate Content",
    "Spam",
    "Other",
  ];

  const submitReport = () => {
    if (!selectedReason || !details) {
      alert("Please select a reason and provide details.");
      return;
    }

    handleSubmit({ accountId, reason: selectedReason, details });
    setSelectedReason("");
    setDetails("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Report User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Select a reason:</Form.Label>
            {reasons.map((reason, index) => (
              <Form.Check
                key={index}
                type="radio"
                label={reason}
                name="reportReason"
                value={reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                checked={selectedReason === reason}
              />
            ))}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Additional Details:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more details about the issue..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={submitReport}>
          Submit Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;
