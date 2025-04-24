import React, { useEffect, useState } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

const CompanyStatistics = () => {
  const [stats, setStats] = useState({
    incomplete: 0,
    pending: 0,
    accredited: 0,
    declined: 0,
    revoked: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-company-statistics`
      );
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching company statistics:", error);
      setStats({
        incomplete: 0,
        pending: 0,
        accredited: 0,
        declined: 0,
        revoked: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(2) : 0;
  };

  const statusItems = [
    {
      key: "pending",
      label: "Pending Review",
      variant: "warning",
      color: "#ffc107",
    },
    {
      key: "accredited",
      label: "Accredited",
      variant: "success",
      color: "#198754",
    },
    {
      key: "incomplete",
      label: "Incomplete",
      variant: "info",
      color: "#17a2b8",
    },
    {
      key: "declined",
      label: "Declined",
      variant: "danger",
      color: "#dc3545",
    },
    {
      key: "revoked",
      label: "Revoked",
      variant: "secondary",
      color: "#6c757d",
    },
  ];

  return (
    <div className="col-md-6">
      <div
        className="card h-80 rounded-3 shadow-sm"
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
                backgroundColor: "rgba(0, 123, 255, 0.1)",
              }}
            >
              <i
                className="bi bi-building-fill"
                style={{ color: "#007bff", fontSize: "1rem" }}
              ></i>
            </div>
            <h5
              className="card-title mb-0 ms-3 fw-semibold"
              style={{ color: "#495057" }}
            >
              Company Accreditation Status
            </h5>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Main Statistics */}
              <div className="d-flex align-items-end mb-3">
                <h2
                  className="display-4 fw-bold mb-0"
                  style={{ color: "#1a4798" }}
                >
                  {stats.total}
                </h2>
                <div className="ms-3 mb-2">
                  <span
                    className="badge bg-light text-dark fw-normal"
                    style={{
                      backgroundColor: "rgba(0, 123, 255, 0.1) !important",
                    }}
                  >
                    <i className="bi bi-buildings me-1"></i> Total Companies
                  </span>
                </div>
              </div>

              {/* Status Breakdown */}
              <Row className="mb-4">
                {statusItems.map((item, index) => (
                  <Col key={item.key} sm={6} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold">{item.label}</span>
                      <span
                        className="small fw-semibold"
                        style={
                          item.variant === "danger" ||
                          item.variant === "success"
                            ? { color: item.color }
                            : {}
                        }
                      >
                        {stats[item.key]} ({getPercentage(stats[item.key])}%)
                      </span>
                    </div>
                    <ProgressBar
                      animated
                      now={getPercentage(stats[item.key])}
                      variant={item.variant}
                      style={{
                        height: "6px",
                        borderRadius: "3px",
                        backgroundColor: `rgba(${parseInt(
                          item.color.slice(1, 3),
                          16
                        )}, ${parseInt(item.color.slice(3, 5), 16)}, ${parseInt(
                          item.color.slice(5, 7),
                          16
                        )}, 0.1)`,
                        marginBottom:
                          index < statusItems.length - 1 ? "12px" : "0",
                      }}
                    />
                  </Col>
                ))}
              </Row>

              {/* Call-to-Action Button */}
              <Link
                to={"/admin/company-reports"}
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2 px-4"
                style={{
                  backgroundColor: "#1a4798",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                  boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                View Detailed Reports
                <i className="bi bi-arrow-right"></i>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyStatistics;
