import React, { useState, useEffect } from "react";
import axios from "axios";
import { AUDIT_TRAIL_API_END_POINT } from "../../utils/constants";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const AuditTrail = () => {
  const [auditTrails, setAuditTrails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllAuditTrail();
  }, []);

  const getAllAuditTrail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${AUDIT_TRAIL_API_END_POINT}/get-all-audit-trail`
      );
      setAuditTrails(res?.data?.auditTrails || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching audit trails:", error);
      setError("Failed to load audit trails");
      setAuditTrails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (details) => {
    setSelectedDetails(details);
    setShowModal(true);
  };

  const renderDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return <div className="text-muted">No details available</div>;
    }

    return (
      <div className="details-container">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="text-primary fw-bold">{key}:</span>{" "}
            <span className="text-muted">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3">
          <div className="d-flex align-items-center">
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
              <i className="bi  bi-pen-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Audit Trail
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Verify company credentials and manage approval status
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive" style={{ overflow: "auto" }}>
          <div style={{ minWidth: "800px" }}>
            {" "}
            {/* Minimum width to trigger horizontal scroll */}
            <table className="table table-hover table-striped">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <tr>
                  <th
                    scope="col"
                    className="small text-muted"
                    style={{ width: "20%" }}
                  >
                    <i className="bi bi-clock-fill me-2"></i>Date & Time
                  </th>
                  <th
                    scope="col"
                    className="small text-muted"
                    style={{ width: "20%" }}
                  >
                    <i className="bi bi-person-fill me-2"></i>Name
                  </th>
                  <th
                    scope="col"
                    className="small text-muted"
                    style={{ width: "20%" }}
                  >
                    <i className="bi bi-envelope-fill me-2"></i>Email
                  </th>
                  <th
                    scope="col"
                    className="small text-muted"
                    style={{ width: "20%" }}
                  >
                    <i className="bi bi-activity me-2"></i>Action
                  </th>
                  <th
                    scope="col"
                    className="small text-muted"
                    style={{ width: "20%" }}
                  >
                    <i className="bi bi-info-circle-fill me-2"></i>Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditTrails.length > 0 ? (
                  auditTrails.map((audit) => (
                    <tr key={audit._id}>
                      <td className="small text-muted" style={{ width: "20%" }}>
                        {new Date(audit?.createdAt).toLocaleString()}
                      </td>
                      <td className="small text-muted" style={{ width: "20%" }}>
                        {audit.accountId
                          ? `${audit.accountId.firstName} ${audit.accountId.lastName}`
                          : "N/A"}
                      </td>
                      <td className="small text-muted" style={{ width: "20%" }}>
                        {audit.accountId?.emailAddress || "N/A"}
                      </td>
                      <td className="small text-muted" style={{ width: "20%" }}>
                        {audit.action}
                      </td>
                      <td className="small text-muted" style={{ width: "20%" }}>
                        {audit.details ? (
                          <Button
                            variant="link"
                            className="p-0 text-primary"
                            onClick={() => handleDetailsClick(audit.details)}
                          >
                            View Details
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <i className="bi bi-inbox-fill text-muted me-2"></i>
                      No audit trails found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="bi bi-info-circle-fill text-primary me-2"></i>
            Action Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {renderDetails(selectedDetails)}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AuditTrail;
