import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./JobFair.css";
import job_fair from "../../images/job-fair.png";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

const JobFair = () => {
  const navigate = useNavigate();
  const [jobFairData, setJobFairData] = useState(null);
  const [preRegistrationData, setPreRegistrationData] = useState(null);
  const [allPreRegistered, setAllPreRegistered] = useState(null);
  const [jobSeekerCount, setJobSeekerCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);

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
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-active-job-fair-event`
      );

      setJobFairData(res?.data?.activeJobFair);
    } catch (error) {
      console.log(error);
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
              <i className="bi bi-flag"></i> Annual{" "}
              {jobFairData?.title || "Job Fair"}
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
