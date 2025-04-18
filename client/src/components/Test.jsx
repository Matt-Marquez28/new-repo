import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../utils/constants";
import { Modal, Spinner, Alert, Button } from "react-bootstrap";

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseAlert, setShowPauseAlert] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanning || isPaused) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText) => {
      if (isPaused) return;
      
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

        setResult(res.data.message);
        setScanning(false);
      } catch (err) {
        console.error("❌ Error processing QR:", err);
        setError(
          err.response?.data?.message || "Something went wrong with the scan."
        );
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
  }, [scanning, isPaused]);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setShowPauseAlert(false);
    } else {
      setIsPaused(true);
      setShowPauseAlert(true);
    }
  };

  const restartScanner = () => {
    setResult(null);
    setError(null);
    setScanning(true);
    setIsPaused(false);
    setShowPauseAlert(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2 className="h4 mb-0">
                <i className="bi bi-qr-code-scan me-2"></i>
                QR Code Scanner
              </h2>
              {scanning && !loading && !result && !error && (
                <Button 
                  variant={isPaused ? "success" : "warning"}
                  onClick={togglePause}
                  size="sm"
                >
                  <i className={`bi bi-${isPaused ? 'play' : 'pause'}-fill me-1`}></i>
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
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
              ) : isPaused ? (
                <div className="py-4">
                  <div className="alert alert-warning">
                    <i className="bi bi-pause-fill me-2"></i>
                    Scanner is paused
                  </div>
                  <button
                    className="btn btn-success mt-3"
                    onClick={togglePause}
                  >
                    <i className="bi bi-play-fill me-2"></i>
                    Resume Scanning
                  </button>
                </div>
              ) : (
                <>
                  {showPauseAlert && (
                    <Alert 
                      variant="info" 
                      onClose={() => setShowPauseAlert(false)} 
                      dismissible
                      className="mb-3"
                    >
                      Scanner has been paused. Click "Resume" to continue.
                    </Alert>
                  )}
                  <div
                    id="reader"
                    style={{ width: "100%", maxWidth: "400px" }}
                    className="mx-auto"
                  ></div>
                </>
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