import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col, Alert } from "react-bootstrap";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const EligibilityProfessionalLicence = () => {
  const [records, setRecords] = useState({
    eligibilities: [],
    professionalLicenses: [],
  });

  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [eligibilityData, setEligibilityData] = useState({
    civilService: "",
    dateTaken: "",
  });

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseData, setLicenseData] = useState({
    prc: "",
    validUntil: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-all-eligibilities-and-licenses`,
        { withCredentials: true }
      );
      const { eligibilities = [], professionalLicenses = [] } = res?.data || {};
      setRecords({ eligibilities, professionalLicenses });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEligibility = async (eligibilityId) => {
    try {
      setDeletingId(eligibilityId);
      await axios.delete(
        `${JOBSEEKER_API_END_POINT}/delete-eligibility/${eligibilityId}`,
        { withCredentials: true }
      );
      setSuccess("Eligibility deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete eligibility:", error);
      setError("Failed to delete eligibility. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteLicense = async (licenseId) => {
    try {
      setDeletingId(licenseId);
      await axios.delete(
        `${JOBSEEKER_API_END_POINT}/delete-professional-license/${licenseId}`,
        { withCredentials: true }
      );
      setSuccess("Professional license deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete license:", error);
      setError("Failed to delete license. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEligibilityClose = () => {
    setShowEligibilityModal(false);
    setEligibilityData({ civilService: "", dateTaken: "" });
  };

  const handleEligibilityShow = () => setShowEligibilityModal(true);

  const handleLicenseClose = () => {
    setShowLicenseModal(false);
    setLicenseData({ prc: "", validUntil: "" });
  };

  const handleLicenseShow = () => setShowLicenseModal(true);

  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setEligibilityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLicenseChange = (e) => {
    const { name, value } = e.target;
    setLicenseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEligibilitySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-eligibility`,
        eligibilityData,
        { withCredentials: true }
      );
      setSuccess("Eligibility added successfully");
      handleEligibilityClose();
      fetchData();
    } catch (error) {
      console.error("Failed to submit eligibility:", error);
      setError("Failed to add eligibility. Please try again.");
    }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-professional-license`,
        licenseData,
        { withCredentials: true }
      );
      setSuccess("Professional license added successfully");
      handleLicenseClose();
      fetchData();
    } catch (error) {
      console.error("Failed to submit license:", error);
      setError("Failed to add license. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    <div className="container mt-3">
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative text-primary">
            <i className="bi bi-file-person-fill"></i> Eligibility /
            Professional License
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-3">
        <Col>
          <Button
            variant="primary"
            onClick={handleEligibilityShow}
            className="me-2"
          >
            Add Eligibility
          </Button>
          <Button variant="success" onClick={handleLicenseShow}>
            Add Professional License
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <div className="card">
            <div className="card-header">
              <h5>Eligibilities</h5>
            </div>
            <div className="card-body">
              {records.eligibilities.length > 0 ? (
                <ul className="list-group">
                  {records.eligibilities.map((item) => (
                    <li
                      key={item._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{item.civilService}</strong> -{" "}
                        {formatDate(item.dateTaken)}
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleDeleteEligibility(item._id)}
                        disabled={deletingId === item._id}
                      >
                        <FaTrash />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No eligibilities added yet.</p>
              )}
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="card">
            <div className="card-header">
              <h5>Professional Licenses</h5>
            </div>
            <div className="card-body">
              {records.professionalLicenses.length > 0 ? (
                <ul className="list-group">
                  {records.professionalLicenses.map((item) => (
                    <li
                      key={item._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{item.prc}</strong> - valid until{" "}
                        {formatDate(item.validUntil)}
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleDeleteLicense(item._id)}
                        disabled={deletingId === item._id}
                      >
                        <FaTrash />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">
                  No professional licenses added yet.
                </p>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Eligibility Modal */}
      <Modal show={showEligibilityModal} onHide={handleEligibilityClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Eligibility</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEligibilitySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Eligibility (Civil Service)</Form.Label>
              <Form.Control
                type="text"
                name="civilService"
                value={eligibilityData.civilService}
                onChange={handleEligibilityChange}
                placeholder="e.g. Civil Service Professional"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date Taken</Form.Label>
              <Form.Control
                type="date"
                name="dateTaken"
                value={eligibilityData.dateTaken}
                onChange={handleEligibilityChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEligibilityClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Professional License Modal */}
      <Modal show={showLicenseModal} onHide={handleLicenseClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Professional License</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLicenseSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Professional Licence (PRC)</Form.Label>
              <Form.Control
                type="text"
                name="prc"
                value={licenseData.prc}
                onChange={handleLicenseChange}
                placeholder="e.g. PRC License Number"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Valid Until</Form.Label>
              <Form.Control
                type="date"
                name="validUntil"
                value={licenseData.validUntil}
                onChange={handleLicenseChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleLicenseClose}>
              Close
            </Button>
            <Button variant="success" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EligibilityProfessionalLicence;
