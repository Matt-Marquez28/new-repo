import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Spinner, Modal, Button } from "react-bootstrap";

const Scanner = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [qrData, setQrData] = useState(null);
  const scannerRef = useRef(null);
  const readerRef = useRef(null);
  const isMountedRef = useRef(true); // Track component mount state

  useEffect(() => {
    return () => {
      isMountedRef.current = false; // Cleanup on unmount
    };
  }, []);

  const handleScanSuccess = async (decodedText, scanner) => {
    try {
      // Pause scanner immediately when QR is detected
      if (isScanning) {
        try {
          await scanner.pause();
          setIsScanning(false);
        } catch (pauseError) {
          console.warn("Could not pause scanner:", pauseError);
        }
      }

      try {
        const parsedData = JSON.parse(decodedText);
        if (isMountedRef.current) {
          setQrData(parsedData);
          setShowConfirmation(true);
        }
      } catch (parseError) {
        console.error("Error parsing QR data:", parseError);
        if (isMountedRef.current) {
          setError("Invalid QR code format");
        }
        await restartScanner();
      }
    } catch (err) {
      console.error("❌ Error processing QR:", err);
      if (isMountedRef.current) {
        setError("Error processing QR code");
      }
      await restartScanner();
    }
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
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

      if (isMountedRef.current) {
        setResult(res?.data?.message);
        setScanCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      if (isMountedRef.current) {
        setError(
          err.response?.data?.message || "Failed to mark attendance"
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    restartScanner();
  };

  const handleScanError = (error) => {
    console.warn("⛔ QR Scan Error:", error);
  };

  const initScanner = async () => {
    if (!readerRef.current) return;

    // Clear any existing scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (clearError) {
        console.warn("Error clearing scanner:", clearError);
      }
    }

    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!isMountedRef.current) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 5,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => handleScanSuccess(decodedText, scanner),
      handleScanError
    );
    setIsScanning(true);
  };

  useEffect(() => {
    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [scanCount]);

  const restartScanner = async () => {
    if (!isMountedRef.current) return;
    
    setResult(null);
    setError(null);
    setQrData(null);
    
    // Add a small delay before reinitializing to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));
    setScanCount((prev) => prev + 1);
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
                  <p className="mt-3">Processing attendance...</p>
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
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Scan Again
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
                    disabled={loading}
                  >
                    <i className="bi bi-qr-code-scan me-2"></i>
                    Scan Another
                  </button>
                </div>
              ) : (
                <div
                  id="reader"
                  ref={readerRef}
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

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={handleCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You're about to mark attendance for:</p>
          {qrData && (
            <div className="text-start p-3 bg-light rounded">
              <p><strong>Event ID:</strong> {qrData.eventId}</p>
              <p><strong>Reference:</strong> {qrData.referenceNumber}</p>
            </div>
          )}
          <p className="mt-3">Is this correct?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm Attendance
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Scanner;