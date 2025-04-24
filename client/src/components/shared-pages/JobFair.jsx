import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "./JobFair.css";
import job_fair from "../../images/job-fair.png";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const JobFair = () => {
  const navigate = useNavigate();
  const [jobFairData, setJobFairData] = useState(null);
  const [preRegistrationData, setPreRegistrationData] = useState(null);
  const [allPreRegistered, setAllPreRegistered] = useState(null);
  const [jobSeekerCount, setJobSeekerCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sample data
  const stats = {
    jobSeekers: 1245,
    employers: 86,
    eventDate: "November 15-16, 2023",
    location: "Convention Center, Downtown",
  };

  useEffect(() => {
    getActiveJobFair();
    getAllPreRegistered();
  }, []);

  useEffect(() => {
    if (jobFairData?._id) {
      getPreRegistration();
    }
  }, [jobFairData]);

  const getActiveJobFair = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-active-job-fair-event`
      );

      setJobFairData(res?.data?.activeJobFair);
    } catch (error) {
      console.log(error);
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
      console.log(res?.data?.preRegistration);
      setPreRegistrationData(res?.data?.preRegistration);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllPreRegistered = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-pre-registered`,
        { withCredentials: true }
      );
      console.log(res?.data?.preRegistration);
      const preregs = res?.data?.preregs || [];

      setAllPreRegistered(preregs);

      // Count roles
      setJobSeekerCount(preregs.filter((p) => p.role === "jobseeker").length);
      setEmployerCount(preregs.filter((p) => p.role === "employer").length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${JOB_VACANCY_API_END_POINT}/pre-register`,
        { eventId: jobFairData?._id },
        { withCredentials: true }
      );
      console.log(res?.data);
      getActiveJobFair();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="job-fair-page">
        <Container className="py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading job fair information...</p>
        </Container>
      </div>
    );
  }

  if (!jobFairData) {
    return (
      <div>
        {/* Animated background elements */}
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>

        <Container className="py-5 position-relative">
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="no-job-fair-icon mb-4">
                <i
                  className="bi bi-calendar-x"
                  style={{ fontSize: "4rem", color: "#6c757d" }}
                ></i>
              </div>

              <h1
                className="display-5 fw-bold mb-3"
                style={{ color: "#1a4798" }}
              >
                No Upcoming Job Fair
              </h1>

              <div
                className="alert alert-info mb-4 mx-auto"
                style={{ maxWidth: "600px" }}
              >
                <i className="bi bi-info-circle-fill me-2"></i>
                There are currently no scheduled job fairs. Check back later or
                subscribe to be notified about future events.
              </div>

              <div className="d-flex justify-content-center gap-3 mb-5">
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </Button>
              </div>

              <div className="past-events mt-5">
                <h4 className="mb-4">
                  <i className="bi bi-clock-history me-2"></i>
                  Past Event Statistics
                </h4>

                <Row className="g-4 justify-content-center">
                  <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 stats-card">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                            <i
                              className="bi bi-calendar-event"
                              style={{ fontSize: "1.5rem" }}
                            ></i>
                          </div>
                          <div>
                            <h5 className="mb-0">Spring 2023</h5>
                            <p className="text-muted small mb-0">
                              March 15-16, 2023
                            </p>
                          </div>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span>
                            <i className="bi bi-people text-primary me-1"></i>
                            1,200+ Job Seekers
                          </span>
                          <span>
                            <i className="bi bi-buildings text-success me-1"></i>
                            85 Employers
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="h-100 shadow-sm border-0 stats-card">
                      <Card.Body>
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                            <i
                              className="bi bi-calendar-event"
                              style={{ fontSize: "1.5rem" }}
                            ></i>
                          </div>
                          <div>
                            <h5 className="mb-0">Fall 2022</h5>
                            <p className="text-muted small mb-0">
                              October 10-11, 2022
                            </p>
                          </div>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span>
                            <i className="bi bi-people text-primary me-1"></i>
                            950+ Job Seekers
                          </span>
                          <span>
                            <i className="bi bi-buildings text-success me-1"></i>
                            72 Employers
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
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
                className="bi bi-calendar-event me-2 text-muted"
                style={{ color: "#ef1b25" }}
              ></i>
              <span className="me-4" style={{ color: "#ef1b25" }}>
                {" "}
                {jobFairData?.date
                  ? format(new Date(jobFairData.date), "MMMM d, yyyy")
                  : "Date not available"}
              </span>
              <i className="bi bi-geo-alt me-2 text-muted"></i>
              <span>{jobFairData?.venue}</span>
            </div>

            <p className="lead mb-4">
              {jobFairData?.description ||
                "Join us for our annual job fair, where job seekers and employers come together to explore opportunities. Network, interview, and find your next career move!"}
            </p>

            <div className="d-flex flex-wrap gap-3">
              <button
                className="btn btn-warning text-white btn-lg pulse"
                onClick={handleSubmit}
              >
                <i className="bi bi-person-plus me-2"></i>
                {preRegistrationData ? "Pre-Registered" : "Pre-Register"}
              </button>
              {preRegistrationData && (
                <Link
                  to="pre-registration-details"
                  className="btn btn-outline-danger btn-lg d-flex align-items-center"
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
