import React, { useState } from "react";
import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";

const ReportModal = ({ show, handleClose, handleSubmit, accountId }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    "Harassment",
    "Scam/Fraud",
    "Inappropriate Content",
    "Spam",
    "Other"
  ];

  const submitReport = async () => {
    if (!selectedReason) {
      setError("Please select a reason");
      return;
    }
    if (!details || details.length < 10) {
      setError("Please provide at least 10 characters of details");
      return;
    }

    setError("");
    setIsSubmitting(true);
    
    try {
      await handleSubmit({ accountId, reason: selectedReason, details });
      setSelectedReason("");
      setDetails("");
      handleClose();
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title className="h5">Report User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="light" className="text-danger border-danger mb-4">
            {error}
          </Alert>
        )}

        <Row>
          <Col md={5} className="border-end pe-md-4">
            <h6 className="mb-3 text-muted">Reason for report</h6>
            <div className="d-flex flex-column gap-2">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className={`p-2 ps-3 rounded cursor-pointer ${selectedReason === reason ? 'bg-light' : ''}`}
                  onClick={() => setSelectedReason(reason)}
                >
                  <div className="d-flex align-items-center">
                    <span className={`me-2 ${selectedReason === reason ? 'text-primary' : 'text-muted'}`}>
                      {selectedReason === reason ? '✓' : '○'}
                    </span>
                    <span>{reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          
          <Col md={7} className="ps-md-4">
            <Form.Group>
              <Form.Label className="text-muted mb-2">Additional details</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe the issue..."
                className="mb-2"
              />
              <small className="text-muted">
                {details.length}/500 characters (minimum 10 required)
              </small>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={submitReport}
          disabled={isSubmitting || !selectedReason || details.length < 10}
          className="px-4"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportModal;