import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../utils/constants";
import { Modal, Spinner, Alert } from "react-bootstrap";

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    const onScanSuccess = async (decodedText) => {
      try {
        setLoading(true);
        setError(null);
        const qrData = JSON.parse(decodedText);

        const res = await axios.post(
          `${JOB_VACANCY_API_END_POINT}/mark-attendance`,
          {
            referenceNumber: qrData.referenceNumber,
            eventId: qrData.eventId,
            role: qrData.role,
            accountId: qrData.accountId,
            jobSeekerId: qrData.jobseekerId,
            employerId: qrData.companyId,
          }
        );

        setResult(res?.data?.message);
        alert(res.data.message);
        setScanning(false);
      } catch (err) {
        console.error("❌ Error processing QR:", err);
        setError(
          err.response?.data?.message || "Something went wrong with the scan."
        );
        alert(err?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    const onScanError = (error) => {
      console.warn("⛔ QR Scan Error:", error);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning]);

  const restartScanner = () => {
    setResult(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0 text-center">
                <i className="bi bi-qr-code-scan me-2"></i>
                QR Code Scanner
              </h2>
            </div>

            <div className="card-body text-center p-4">
              {loading ? (
                <div className="py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Processing QR code...</p>
                </div>
              ) : error ? (
                <div className="py-4">
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={restartScanner}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Try Again
                  </button>
                </div>
              ) : result ? (
                <div className="py-4">
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {result}
                  </div>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={restartScanner}
                  >
                    <i className="bi bi-qr-code-scan me-2"></i>
                    Scan Another
                  </button>
                </div>
              ) : (
                <div
                  id="reader"
                  style={{ width: "100%", maxWidth: "400px" }}
                  className="mx-auto"
                ></div>
              )}
            </div>

            <div className="card-footer bg-light text-center">
              <small className="text-muted">
                Position QR code within frame to scan
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
