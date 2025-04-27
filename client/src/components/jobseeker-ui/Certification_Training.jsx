import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Table,
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";

const CertificationTraining = () => {
  const [showModal, setShowModal] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    trainingName: "",
    hours: "",
    institution: "",
    skills: "",
    certificate: "",
  });
  const [certificateReceived, setCertificateReceived] = useState(false);

  // Fetch trainings on component mount
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${JOBSEEKER_API_END_POINT}/get-all-trainings`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Transform skills array to comma-separated string for the form
          const transformedData = response.data.data.map((training) => ({
            ...training,
            skills: Array.isArray(training.skills)
              ? training.skills.join(", ")
              : training.skills,
          }));
          setCertifications(transformedData);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch trainings");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCertificateToggle = (e) => {
    setCertificateReceived(e.target.checked);
    if (!e.target.checked) {
      setFormData({
        ...formData,
        certificate: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const certificationToAdd = {
        ...formData,
        hours: Number(formData.hours),
        skills: formData.skills.split(",").map((skill) => skill.trim()),
      };

      // Add to backend
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/add-training`,
        certificationToAdd,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Add to frontend state
        setCertifications([...certifications, res.data.data]);
        setFormData({
          trainingName: "",
          hours: "",
          institution: "",
          skills: "",
          certificate: "",
        });
        setCertificateReceived(false);
        setShowModal(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add training");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (index, trainingId) => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${JOBSEEKER_API_END_POINT}/delete-training/${trainingId}`,
        { withCredentials: true }
      );
      console.log(res.data);
      // Optimistic UI update
      const updatedCertifications = [...certifications];
      updatedCertifications.splice(index, 1);
      setCertifications(updatedCertifications);
    } catch (error) {
      setError("Failed to delete training");
    } finally {
      setLoading(false);
    }
  };

  if (loading && certifications.length === 0) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="container">
      {/* <Row className="mb-4">
        <Col>
          <h2>Certification & Training</h2>
          <p className="text-muted">
            Manage your professional certifications and training programs
          </p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add Certification/Training
          </Button>
        </Col>
      </Row> */}
      <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center my-3">
        <div className="d-flex align-items-center mb-2 mb-md-0">
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
            <i className="bi bi-mortarboard-fill text-white"></i>
          </div>
          <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
            Certification & Training
          </h5>
        </div>

        <div className="d-flex justify-content-end">
          <button
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
            onClick={() => setShowModal(true)}
          >
            Add Certification / Training
          </button>
        </div>
      </div>

      {certifications.length > 0 ? (
        <Card>
          <Card.Body style={{ padding: 0 }}>
            <div
              className="table-responsive"
              style={{
                width: "100%",
                overflowX: "auto",
                overflowY: "visible",
              }}
            >
              
              <Table
                striped
                bordered
                hover
                style={{ minWidth: "800px", margin: 0 }}
              >
                <thead>
                  <tr>
                    <th style={{ minWidth: "200px" }}>Training / Course</th>
                    <th style={{ minWidth: "100px" }}>Hours</th>
                    <th style={{ minWidth: "200px" }}>Institution</th>
                    <th style={{ minWidth: "200px" }}>Skills Acquired</th>
                    <th style={{ minWidth: "150px" }}>Certificate</th>
                    <th className="text-center" style={{ minWidth: "100px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert, index) => (
                    <tr key={index}>
                      <td>{cert.trainingName}</td>
                      <td>{cert.hours}</td>
                      <td>{cert.institution}</td>
                      <td>
                        {Array.isArray(cert.skills)
                          ? cert.skills.join(", ")
                          : cert.skills}
                      </td>
                      <td>{cert.certificate || "None"}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(index, cert._id)}
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No certifications or training added yet</h5>
            <p className="text-muted">
              Click the button above to add your first certification or training
            </p>
          </Card.Body>
        </Card>
      )}

      <Modal
        centered
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Certification/Training</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Training / Vocational Course</Form.Label>
              <Form.Control
                type="text"
                name="trainingName"
                value={formData.trainingName}
                onChange={handleInputChange}
                required
                placeholder="e.g. Advanced React Development"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hours of training</Form.Label>
                  <Form.Control
                    type="number"
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 40"
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Training Institution</Form.Label>
                  <Form.Control
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Udemy, Coursera, University Name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Skills Acquired (comma separated)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="React, JavaScript, Teamwork"
              />
            </Form.Group>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Certificate Received"
                    checked={certificateReceived}
                    onChange={handleCertificateToggle}
                  />
                </Form.Group>
              </Col>
            </Row>

            {certificateReceived && (
              <Form.Group className="mb-3">
                <Form.Label>Certificate Details</Form.Label>
                <Form.Control
                  type="text"
                  name="certificate"
                  value={formData.certificate}
                  onChange={handleInputChange}
                  placeholder="e.g. Certificate ID, Award Date, etc."
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant=""
              style={{ backgroundColor: "#1a4798", color: "white" }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Certification"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificationTraining;
