import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { ClipLoader } from "react-spinners";

const PreRegistrationDetails = () => {
  const [preRegistrationData, setPreRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPreRegistration();
  }, []);

  const getPreRegistration = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-pre-registration`,
        { withCredentials: true }
      );
      setPreRegistrationData(res?.data?.preRegistration);
      setError(null);
    } catch (error) {
      console.error("Error fetching preregistration data:", error);
      setError("Failed to load registration details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!preRegistrationData?.qrCode) return;

    const link = document.createElement("a");
    link.href = preRegistrationData.qrCode;
    link.download = `job-fair-qr-${preRegistrationData.referenceNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!preRegistrationData?.referenceNumber) return;

    navigator.clipboard.writeText(preRegistrationData.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5">
        <ClipLoader color="#0d6efd" size={50} />
        <p className="mt-3 text-muted">Loading your registration details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div
          className="alert alert-danger mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <h2 className="h4 fw-bold mb-3">Error Loading Details</h2>
          <p className="mb-3">{error}</p>
          <button onClick={getPreRegistration} className="btn btn-danger">
            <i className="bi bi-arrow-clockwise me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!preRegistrationData) {
    return (
      <div className="text-center py-5">
        <div
          className="alert alert-warning mx-auto"
          style={{ maxWidth: "500px" }}
        >
          <h2 className="h4 fw-bold mb-3">No Registration Found</h2>
          <p className="mb-0">You haven't registered for the job fair yet.</p>
        </div>
      </div>
    );
  }

  const { role, referenceNumber, qrCode, eventId } = preRegistrationData;

  return (
    <div className="container py-5">
      <div
        className="card border-0 shadow-sm mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0 text-center">
            <i className="bi bi-person-badge me-2"></i>
            Job Fair Digital Pass
          </h2>
        </div>

        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="bg-light p-3 d-inline-block rounded">
              <img
                src={qrCode}
                alt="QR Code"
                className="img-fluid"
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-muted">Role</span>
              <span className="fw-bold text-capitalize">{role}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-muted">Reference Number</span>
              <div className="d-flex align-items-center">
                <span className="font-monospace me-2">{referenceNumber}</span>
                <button
                  onClick={copyToClipboard}
                  className="btn btn-sm btn-outline-secondary"
                  title="Copy to clipboard"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>

            {eventId && (
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <span className="text-muted">Event ID</span>
                <span className="fw-bold">{eventId}</span>
              </div>
            )}
          </div>

          {copied && (
            <div
              className="alert alert-success alert-dismissible fade show py-2"
              role="alert"
            >
              <small>Copied to clipboard!</small>
            </div>
          )}

          <div className="alert alert-info mb-4">
            <small>
              <i className="bi bi-info-circle me-2"></i>
              Show this QR code at the job fair entrance for fast check-in.
            </small>
          </div>

          <button onClick={handleDownloadQR} className="btn btn-primary w-100">
            <i className="bi bi-download me-2"></i>Download QR Code
          </button>
        </div>

        <div className="card-footer bg-light text-center">
          <small className="text-muted">
            Need help?{" "}
            <a href="#" className="text-decoration-none">
              Contact support
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default PreRegistrationDetails;
