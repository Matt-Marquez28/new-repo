import React, { useEffect, useState } from "react";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Link } from "react-router-dom";

const CompanyStatisticsCard = () => {
  const [stats, setStats] = useState({ all: 0, accredited: 0 });

  useEffect(() => {
    getAllCompanies();
  }, []);

  const getAllCompanies = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-all-companies`);
      const { stats } = res.data;
      setStats(stats || { all: 0, accredited: 0 });
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate the percentage of accredited companies
  const percentageAccredited =
    stats.all > 0 ? ((stats.accredited / stats.all) * 100).toFixed(2) : 0;

  return (
    <div className="col-md-6 mb-4">
      <div
        className="card h-70 rounded border-0 shadow-sm bg-light"
        style={{
          backgroundColor: "#ffffff",
          padding: "1rem",
        }}
      >
        <div className="card-body">
          {/* Header Section */}

          {/* Main Statistics */}
          <div className="d-flex justify-content-start align-items-center mb-1">
            <h2 className="display-4 fw-bold" style={{ color: "#007bff" }}>
              {stats.accredited}
            </h2>
            <h4
              className="card-title mb-0 ms-3 fw-bold"
              style={{ color: "#555555" }}
            >
              Accredited Companies
            </h4>
          </div>

          <p className="text-muted small">
            Total accredited companies out of{" "}
            <span className="fw-bold" style={{ color: "#333" }}>
              {stats.all}
            </span>
          </p>

          {/* React Bootstrap ProgressBar */}
          <ProgressBar
            now={percentageAccredited}
            animated
            style={{
              height: "8px",
              backgroundColor: "#e9ecef",
            }}
            variant="primary"
          />
          <p className="text-muted small mt-2">
            Accreditation Rate:{" "}
            <span className="fw-bold" style={{ color: "#007bff" }}>
              {percentageAccredited}%
            </span>
          </p>

          {/* Call-to-Action Button */}
          <Link
            to={"accredited-companies"}
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

export default CompanyStatisticsCard;
