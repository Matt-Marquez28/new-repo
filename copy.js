import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import {Col, Row, Container} from "react-bootstrap";

const CertificationTraining = () => {
  const [showModal, setShowModal] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCerts, setExpandedCerts] = useState([]);
  const [formData, setFormData] = useState({
    trainingName: "",
    hours: "",
    institution: "",
    skills: "",
    certificate: "",
  });
  const [certificateReceived, setCertificateReceived] = useState(false);

  // Fetch certifications on component mount
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${JOBSEEKER_API_END_POINT}/get-all-trainings`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const transformedData = response.data.data.map((cert) => ({
            ...cert,
            skills: Array.isArray(cert.skills) ? cert.skills.join(", ") : cert.skills,
          }));
          setCertifications(transformedData);
          setExpandedCerts(new Array(transformedData.length).fill(false));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch certifications");
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  const toggleCertDetails = (index) => {
    const newExpandedCerts = [...expandedCerts];
    newExpandedCerts[index] = !newExpandedCerts[index];
    setExpandedCerts(newExpandedCerts);
  };

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

      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/add-training`,
        certificationToAdd,
        { withCredentials: true }
      );

      if (res.data.success) {
        const newCert = {
          ...res.data.data,
          skills: Array.isArray(res.data.data.skills)
            ? res.data.data.skills.join(", ")
            : res.data.data.skills,
        };
        setCertifications([...certifications, newCert]);
        setExpandedCerts([...expandedCerts, false]);
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
      setError(error.response?.data?.message || "Failed to add certification");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (index, certId) => {
    try {
      setLoading(true);
      await axios.delete(
        `${JOBSEEKER_API_END_POINT}/delete-training/${certId}`,
        { withCredentials: true }
      );
      const updatedCerts = [...certifications];
      updatedCerts.splice(index, 1);
      setCertifications(updatedCerts);
      const updatedExpanded = [...expandedCerts];
      updatedExpanded.splice(index, 1);
      setExpandedCerts(updatedExpanded);
    } catch (error) {
      setError("Failed to delete certification");
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
    <section className="bg-light p-3 rounded border">
      <h5 className="d-flex align-items-center gap-2 mb-3" style={{ color: "#1a4798" }}>
        <i className="bi bi-award-fill"></i>
        Certifications & Training
      </h5>

      <div className="position-relative">
        <div
          className="position-absolute top-0 start-0 h-100"
          style={{
            width: "2px",
            backgroundColor: "#1a4798",
            marginLeft: "5px",
          }}
        ></div>

        {certifications.length > 0 ? (
          certifications.map((cert, index) => (
            <div className="position-relative mb-4" key={index}>
              <div
                className="position-absolute top-0 start-0 translate-middle rounded-circle"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#1a4798",
                  border: "2px solid white",
                  boxShadow: "0 0 0 1px #1a4798",
                  marginLeft: "5px",
                }}
              ></div>

              <div className="ms-4 ps-2">
                <div className="bg-white p-3 rounded border">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1 fw-bold">{cert.trainingName}</h6>
                      <p className="text-muted small mb-2">
                        {cert.institution} • {cert.hours} hours
                      </p>
                    </div>
                    {cert.certificate && (
                      <Badge bg="success" className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-check-fill me-1"></i>
                        Certified
                      </Badge>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => toggleCertDetails(index)}
                      style={{
                        borderColor: "#1a4798",
                        color: "#1a4798",
                      }}
                    >
                      <i
                        className={`bi bi-chevron-${
                          expandedCerts[index] ? "up" : "down"
                        } me-1`}
                      ></i>
                      {expandedCerts[index] ? "Less Details" : "More Details"}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => handleRemove(index, cert._id)}
                      style={{
                        borderColor: "#dc3545",
                        color: "#dc3545",
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {expandedCerts[index] && (
                    <div className="mt-3">
                      {cert.skills && (
                        <div className="mb-3">
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-tools" style={{ color: "#1a4798" }}></i>
                            Skills Acquired
                          </h6>
                          <ul className="list-unstyled">
                            {cert.skills.split(",").map((skill, i) => (
                              <li key={i} className="d-flex mb-2">
                                <span className="me-2">•</span>
                                <span className="small">{skill.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {cert.certificate && (
                        <div>
                          <h6 className="small fw-semibold d-flex align-items-center gap-2">
                            <i className="bi bi-file-text" style={{ color: "#1a4798" }}></i>
                            Certificate Details
                          </h6>
                          <p className="small mb-0">{cert.certificate}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-award" style={{ fontSize: "2rem", color: "#6c757d" }}></i>
            <p className="mt-2 mb-0">No certifications or training added yet</p>
            <Button
              variant="outline-primary"
              className="mt-3"
              onClick={() => setShowModal(true)}
              style={{ borderColor: "#1a4798", color: "#1a4798" }}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Add Certification
            </Button>
          </div>
        )}
      </div>

      <Modal
        centered
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <Modal.Title>Add Certification/Training</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Label>Training / Course Name</Form.Label>
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
                  <Form.Label>Hours Completed</Form.Label>
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
                  <Form.Label>Institution</Form.Label>
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
              <Form.Label>Skills Acquired</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="List skills separated by commas (e.g. React, JavaScript, Teamwork)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="I received a certificate for this training"
                checked={certificateReceived}
                onChange={handleCertificateToggle}
              />
            </Form.Group>

            {certificateReceived && (
              <Form.Group className="mb-3">
                <Form.Label>Certificate Details</Form.Label>
                <Form.Control
                  type="text"
                  name="certificate"
                  value={formData.certificate}
                  onChange={handleInputChange}
                  placeholder="Certificate ID, Award Date, etc."
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Certification"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </section>
  );
};

export default CertificationTraining;