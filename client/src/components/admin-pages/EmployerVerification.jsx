import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import axios from "axios";

const EmployerVerification = () => {
  const [accreditationId, setAccreditationId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await axios.post(
        `${COMPANY_API_END_POINT}/verify-accreditation`,
        { accreditationId }
      );

      // Store the entire response data
      setVerificationResult(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header
              className="text-white"
              style={{ backgroundColor: "#1a4798" }}
            >
              <h5 className="text-center mb-0"><i className="bi bi-person-check-fill"></i> Employer Verification</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="accreditationId" className="mb-4">
                  <Form.Label>Accreditation ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={accreditationId}
                    onChange={(e) => setAccreditationId(e.target.value)}
                    placeholder="Enter accreditation ID"
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" disabled={loading} style={{ backgroundColor: "#1a4798", borderColor: "#1a4798" }}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify Accreditation"
                    )}
                  </Button>
                </div>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}

              {verificationResult && (
                <div className="mt-4">
                  {verificationResult.success ? (
                    <>
                      <Alert variant="success">
                        <i className="fas fa-check-circle me-2"></i>
                        {verificationResult.message}
                      </Alert>

                      <Card className="mt-3">
                        <Card.Header className="bg-light">
                          <h5 className="mb-0">Company Information</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-2">
                            <strong>Business Name:</strong>{" "}
                            {verificationResult.data.businessName}
                          </div>
                          <div className="mb-2">
                            <strong>TIN Number:</strong>{" "}
                            {verificationResult.data.tinNumber}
                          </div>
                          <div className="mb-2">
                            <strong>Accreditation ID:</strong>{" "}
                            {verificationResult.data.accreditationId}
                          </div>
                          <div className="mb-2">
                            <strong>Accreditation Date:</strong>{" "}
                            {new Date(
                              verificationResult.data.accreditationDate
                            ).toLocaleDateString()}
                          </div>
                          <div className="mb-2">
                            <strong>Status:</strong>
                            <span
                              className={`badge bg-${
                                verificationResult.data.status === "accredited"
                                  ? "success"
                                  : "warning"
                              } ms-2`}
                            >
                              {verificationResult.data.status}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <Alert variant="warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {verificationResult.message}
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-muted text-center">
              Need help? Contact pesocityoftaguig@gmail.com
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployerVerification;
