import React, { useEffect, useState } from "react";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Link } from "react-router-dom";

const CompanyStatisticsCard = () => {
  const [stats, setStats] = useState({ all: 0, accredited: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCompanies();
  }, []);

  const getAllCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-all-companies`);
      const { stats } = res.data;
      setStats(stats || { all: 0, accredited: 0 });
    } catch (error) {
      console.error(error);
      setStats({ all: 0, accredited: 0 });
    } finally {
      setLoading(false);
    }
  };

  const percentageAccredited =
    stats.all > 0 ? ((stats.accredited / stats.all) * 100).toFixed(2) : 0;

  return (
    <div className="col-md-6">
      <div
        className="card h-70 rounded-3 shadow-sm"
        style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderLeft: "4px solid #1a4798",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="card-body p-0">
          {/* Header with Bootstrap icon */}
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(0, 123, 255, 0.1)", // Light blue background
              }}
            >
              <i
                className="bi bi-award-fill"
                style={{ color: "#007bff", fontSize: "1rem" }}
              ></i>
            </div>
            <h5
              className="card-title mb-0 ms-3 fw-semibold"
              style={{ color: "#495057" }}
            >
              Accreditation Statistics
            </h5>
          </div>

          {/* Main Statistics */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-end mb-3">
                <h2
                  className="display-4 fw-bold mb-0"
                  style={{ color: "#1a4798" }}
                >
                  {stats.accredited}
                </h2>
                <div className="ms-3 mb-2">
                  <span
                    className="badge bg-light text-dark fw-normal"
                    style={{
                      backgroundColor: "rgba(0, 123, 255, 0.1) !important",
                    }}
                  >
                    <i className="bi bi-building-fill me-1"></i> {stats.all}{" "}
                    total
                  </span>
                </div>
              </div>

              <p className="text-muted small mb-3">
                Verified accredited companies in our system
              </p>

              {/* Progress Bar with improved styling */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small fw-semibold">
                    Accreditation Progress
                  </span>
                  <span
                    className="small fw-semibold"
                    style={{ color: "#1a4798" }}
                  >
                    {percentageAccredited}%
                  </span>
                </div>
                <ProgressBar
                  now={percentageAccredited}
                  animated
                  style={{
                    height: "10px",
                    borderRadius: "5px",
                    backgroundColor: "rgba(0, 123, 255, 0.1)",
                  }}
                  variant="primary" // Blue progress bar
                />
              </div>

              {/* Call-to-Action Button */}
              <Link
                to={"accredited-companies"}
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                style={{
                  backgroundColor: "#1a4798",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                  boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
                  transition: "all 0.3s ease",
                }}
                // onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                // onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                View Accredited Companies
                <i className="bi bi-arrow-right"></i>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyStatisticsCard;
