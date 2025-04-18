import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../utils/constants";
import { Modal, Spinner, Alert, Button } from "react-bootstrap";

const QRScanner = () => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    const scannerInstance = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    const onScanSuccess = async (decodedText) => {
      try {
        // Pause scanning while processing
        scannerInstance.pause();
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
        setShowSuccessModal(true);
        setScanning(false);
      } catch (err) {
        console.error("❌ Error processing QR:", err);
        setError(
          err.response?.data?.message || 
          "Invalid QR code or network error. Please try again."
        );
        // Resume scanning on error
        scannerInstance.resume();
      } finally {
        setLoading(false);
      }
    };

    const onScanError = (error) => {
      if (error !== "NotFoundException: No MultiFormat Readers were able to detect the code.") {
        console.warn("⛔ QR Scan Error:", error);
        setError("Scanning error. Please try again.");
      }
    };

    scannerInstance.render(onScanSuccess, onScanError);
    setScanner(scannerInstance);

    return () => {
      scannerInstance.clear().catch(console.error);
    };
  }, [scanning]);

  const restartScanner = () => {
    setResult(null);
    setError(null);
    setScanning(true);
    setShowSuccessModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    restartScanner();
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
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <Alert.Heading>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Scan Failed
                    </Alert.Heading>
                    <p>{error}</p>
                  </Alert>
                  <Button
                    variant="primary"
                    onClick={restartScanner}
                    className="mt-3"
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Try Again
                  </Button>
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

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bi bi-check-circle-fill me-2"></i>
            Scan Successful
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="bi bi-check-circle text-success" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3">{result}</h4>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuccessModal}>
            Close
          </Button>
          <Button variant="success" onClick={restartScanner}>
            <i className="bi bi-qr-code-scan me-2"></i>
            Scan Another
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QRScanner;