import React, { useEffect, useState } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { Link } from "react-router-dom";

const ApplicantStatisticsCard = () => {
  const [stats, setStats] = useState({ hired: 0, total: 0 });

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/get-all-applicants`
      );
      const applicants = res.data.applicants || [];
      const hiredCount = applicants.filter(
        (applicant) => applicant.status === "hired"
      ).length;
      setStats({ hired: hiredCount, total: applicants.length });
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setStats({ hired: 0, total: 0 }); // Fallback in case of error
    }
  };

  const percentageHired =
    stats.total > 0 ? ((stats.hired / stats.total) * 100).toFixed(2) : 0;

  return (
    <div className="col-md-6 mb-4">
      <div
        className="card h-80 rounded border-0 shadow-sm bg-light"
        style={{
          backgroundColor: "#ffffff",
          padding: "1rem",
        }}
      >
        <div className="card-body">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center"></div>
          </div>

          {/* Main Statistics */}
          <div className="d-flex align-items-center">
            <h2 className="display-4 fw-bold" style={{ color: "#007bff" }}>
              {stats.hired}
            </h2>
            <h4
              className="card-title mb-0 ms-3 fw-bold"
              style={{ color: "#555555" }}
            >
              Hired Applicants
            </h4>
          </div>
          <p className="text-muted small">
            Total hired applicants out of{" "}
            <span className="fw-bold" style={{ color: "#333" }}>
              {stats.total}
            </span>
          </p>

          {/* Progress Bar */}
          <ProgressBar
            now={percentageHired}
            animated
            style={{
              height: "8px",
              backgroundColor: "#e9ecef",
            }}
            variant="primary"
          />
          <p className="text-muted small mt-2">
            Hiring Rate:{" "}
            <span className="fw-bold" style={{ color: "#007bff" }}>
              {percentageHired}%
            </span>
          </p>

          {/* Call-to-Action Button */}
          <Link
            to={"hired-applicants"}
            className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-2"
            style={{
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            View Reports
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicantStatisticsCard;
