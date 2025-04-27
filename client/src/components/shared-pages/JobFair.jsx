import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import "./JobFair.css";
import job_fair from "../../images/job-fair.png";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { format, isAfter } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const JobFair = () => {
  const navigate = useNavigate();
  const [jobFairData, setJobFairData] = useState(null);
  const [preRegistrationData, setPreRegistrationData] = useState(null);
  const [allPreRegistered, setAllPreRegistered] = useState([]);
  const [jobSeekerCount, setJobSeekerCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [unregisterLoading, setUnregisterLoading] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getActiveJobFair();
    getAllPreRegistered();
  }, []);

  useEffect(() => {
    if (jobFairData?._id) {
      getPreRegistration();
      // Check if registration deadline has passed
      if (jobFairData.registrationDeadline) {
        const deadline = new Date(jobFairData.registrationDeadline);
        const now = new Date();
        setRegistrationClosed(isAfter(now, deadline));
      }
    }
  }, [jobFairData]);

  const getActiveJobFair = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-active-job-fair-event`
      );
      setJobFairData(res?.data?.activeJobFair || null);
    } catch (error) {
      console.error("Error fetching job fair:", error);
      setError("Failed to load job fair information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPreRegistration = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-pre-registration`,
        { withCredentials: true }
      );
      setPreRegistrationData(res?.data?.preRegistration || null);
    } catch (error) {
      console.error("Error fetching pre-registration:", error);
      setPreRegistrationData(null);
    }
  };

  const getAllPreRegistered = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-pre-registered`,
        { withCredentials: true }
      );
      const preregs = res?.data?.preregs || [];
      setAllPreRegistered(preregs);
      setJobSeekerCount(preregs.filter((p) => p.role === "jobseeker").length);
      setEmployerCount(preregs.filter((p) => p.role === "employer").length);
    } catch (error) {
      console.error("Error fetching pre-registered users:", error);
      setAllPreRegistered([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setRegisterLoading(true);
      setError(null);
      const res = await axios.post(
        `${JOB_VACANCY_API_END_POINT}/pre-register`,
        { eventId: jobFairData?._id },
        { withCredentials: true }
      );
      await getPreRegistration();
      await getAllPreRegistered();
    } catch (error) {
      console.error("Registration error:", error);
      setError(error?.response?.data?.message || "Failed to pre-register. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      const confirmUnregister = window.confirm(
        "Are you sure you want to unregister from this job fair?"
      );
      if (confirmUnregister) {
        setUnregisterLoading(true);
        setError(null);
        await axios.delete(
          `${JOB_VACANCY_API_END_POINT}/cancel-pre-registration/${jobFairData?._id}`,
          { withCredentials: true }
        );

        // Refresh the data
        await getPreRegistration();
        await getAllPreRegistered();
      }
    } catch (error) {
      console.error("Unregistration error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to unregister. Please try again."
      );
    } finally {
      setUnregisterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="job-fair-page">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading job fair information...</p>
        </Container>
      </div>
    );
  }

  if (!jobFairData) {
    return (
      <div className="job-fair-page">
        <Container className="py-5 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={job_fair}
              alt="No active job fair"
              className="img-fluid mb-4"
              style={{ maxWidth: "300px" }}
            />
            <h2 className="mb-3">No Active Job Fair</h2>
            <p className="lead text-muted mb-4">
              There are currently no active job fairs. Please check back later for upcoming events.
            </p>
            <Button variant="outline-primary" onClick={getActiveJobFair}>
              <i className="bi bi-arrow-repeat me-2"></i>
              Check Again
            </Button>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="job-fair-page">
      {/* Animated background elements */}
      <div className="floating-circle circle-1"></div>
      <div className="floating-circle circle-2"></div>
      <div className="floating-circle circle-3"></div>

      <Container className="py-5 position-relative">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {/* Hero Section */}
        <Row className="mb-5 align-items-center">
          <Col lg={7} className="mb-4 mb-lg-0">
            <h1 className="display-4 fw-bold mb-4" style={{ color: "#1a4798" }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                className="d-flex align-items-center"
              >
                <i className="bi bi-flag me-3"></i>
                {jobFairData?.title || "Job Fair"}
              </motion.div>
            </h1>

            <div className="d-flex align-items-center mb-4">
              <i
                className="bi bi-calendar-event me-2"
                style={{ color: "#ef1b25" }}
              ></i>
              <span className="me-4" style={{ color: "#ef1b25" }}>
                {jobFairData?.date
                  ? format(new Date(jobFairData.date), "MMMM d, yyyy")
                  : "Date not available"}
              </span>
              <i className="bi bi-geo-alt me-2"></i>
              <span>{jobFairData?.venue}</span>
            </div>

            {jobFairData?.registrationDeadline && (
              <div className="mb-3">
                <i className="bi bi-clock-history me-2"></i>
                <span className="fw-bold">Registration Deadline: </span>
                <span>
                  {format(
                    new Date(jobFairData.registrationDeadline),
                    "MMMM d, yyyy h:mm a"
                  )}
                </span>
                {registrationClosed && (
                  <span className="badge bg-danger ms-2">Closed</span>
                )}
              </div>
            )}

            <p className="lead mb-4">
              {jobFairData?.description ||
                "Join us for our annual job fair, where job seekers and employers come together to explore opportunities. Network, interview, and find your next career move!"}
            </p>

            <div className="d-flex flex-wrap gap-3">
              {registrationClosed ? (
                <Button variant="secondary" size="lg" disabled>
                  <i className="bi bi-lock me-2"></i>
                  Registration Closed
                </Button>
              ) : preRegistrationData ? (
                <>
                  <Button variant="success" size="lg" disabled>
                    <i className="bi bi-check-circle me-2"></i>
                    Pre-Registered
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="lg"
                    onClick={handleUnregister}
                    disabled={unregisterLoading}
                  >
                    {unregisterLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Unregistering...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Unregister
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="warning"
                  className="text-white btn-lg pulse"
                  onClick={handleSubmit}
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Pre-Register
                    </>
                  )}
                </Button>
              )}

              {preRegistrationData && (
                <Link
                  to="pre-registration-details"
                  className="btn btn-outline-primary btn-lg d-flex align-items-center"
                >
                  <i className="bi bi-card-checklist me-2"></i>
                  View Registration
                </Link>
              )}
            </div>
          </Col>

          <Col lg={5} className="d-none d-lg-block">
            <div className="image-container">
              <img
                src={job_fair}
                alt="Job Fair Illustration"
                className="img-fluid floating"
              />
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0 stats-card">
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                  <i
                    className="bi bi-people-fill text-primary"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{jobSeekerCount}</h3>
                  <p className="text-muted mb-0">Pre-Registered Job Seekers</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 shadow-sm border-0 stats-card">
              <Card.Body className="p-4 d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-4">
                  <i
                    className="bi bi-building-fill text-success"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{employerCount}</h3>
                  <p className="text-muted mb-0">Pre-Registered Employers</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Info */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <small className="text-muted">
                Verified participants receive priority access and early
                notifications
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default JobFair;