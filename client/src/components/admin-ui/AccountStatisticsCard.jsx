import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Link } from "react-router-dom";

const AccountStatistics = () => {
  const [stats, setStats] = useState({
    jobseekers: 0,
    employers: 0,
    totalActiveAccounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${ACCOUNT_API_END_POINT}/account-stats`
        );
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError("Failed to load statistics");
        }
      } catch (err) {
        setError("Error connecting to server");
        console.error("Error fetching statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const activePercentage =
    stats.totalActiveAccounts > 0
      ? (
          (stats.totalActiveAccounts / (stats.jobseekers + stats.employers)) *
          100
        ).toFixed(2)
      : 0;

  if (error) {
    return (
      <div className="col-12">
        <div
          className="card rounded-3 shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            padding: "1.5rem",
            borderLeft: "4px solid #dc3545",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-12 my-3">
      <div
        className="card rounded-3 shadow-sm"
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
                backgroundColor: "rgba(111, 66, 193, 0.1)",
              }}
            >
              <i
                className="bi bi-people-fill"
                style={{ color: "#6f42c1", fontSize: "1rem" }}
              ></i>
            </div>
            <h5
              className="card-title mb-0 ms-3 fw-semibold"
              style={{ color: "#495057" }}
            >
              User Statistics Dashboard
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
              {/* Main Statistics - Expanded Layout */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3 mb-md-0">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="me-3">
                      <span className="badge bg-primary rounded-circle p-2">
                        <i
                          className="bi bi-person-fill"
                          style={{ fontSize: "1rem" }}
                        ></i>
                      </span>
                    </div>
                    <div>
                      <h6 className="mb-0 text-muted small">Job Seekers</h6>
                      <h3 className="mb-0 fw-bold" style={{ color: "#6f42c1" }}>
                        {stats.jobseekers.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3 mb-md-0">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="me-3">
                      <span className="badge bg-success rounded-circle p-2">
                        <i
                          className="bi bi-building-fill"
                          style={{ fontSize: "1rem" }}
                        ></i>
                      </span>
                    </div>
                    <div>
                      <h6 className="mb-0 text-muted small">Employers</h6>
                      <h3 className="mb-0 fw-bold" style={{ color: "#28a745" }}>
                        {stats.employers.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3 mb-md-0">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="me-3">
                      <span className="badge bg-info rounded-circle p-2">
                        <i
                          className="bi bi-person-check-fill"
                          style={{ fontSize: "1rem" }}
                        ></i>
                      </span>
                    </div>
                    <div>
                      <h6 className="mb-0 text-muted small">Active Users</h6>
                      <h3 className="mb-0 fw-bold" style={{ color: "#0dcaf0" }}>
                        {stats.totalActiveAccounts.toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="d-flex align-items-center p-3 bg-light rounded">
                    <div className="me-3">
                      <span className="badge bg-secondary rounded-circle p-2">
                        <i
                          className="bi bi-people-fill"
                          style={{ fontSize: "1rem" }}
                        ></i>
                      </span>
                    </div>
                    <div>
                      <h6 className="mb-0 text-muted small">Total Accounts</h6>
                      <h3 className="mb-0 fw-bold" style={{ color: "#6c757d" }}>
                        {(stats.jobseekers + stats.employers).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Users Section - Expanded */}
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6
                        className="mb-0 fw-semibold"
                        style={{ color: "#495057" }}
                      >
                        User Activity Overview
                      </h6>
                      <span className="badge bg-info">
                        {activePercentage}% Active
                      </span>
                    </div>
                    <ProgressBar
                      now={activePercentage}
                      label={`${stats.totalActiveAccounts.toLocaleString()} active users`}
                      variant="info"
                      animated
                      style={{
                        height: "20px",
                        borderRadius: "5px",
                      }}
                    />
                    <div className="mt-3">
                      <div className="d-flex justify-content-between">
                        <span className="small text-muted">
                          {stats.totalActiveAccounts.toLocaleString()} Active Users
                        </span>
                       
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="d-flex flex-column">
                    <div className="mb-auto p-3 bg-light rounded h-100">
                      <h6
                        className="fw-semibold mb-3"
                        style={{ color: "#495057" }}
                      >
                        Quick Actions
                      </h6>
                      <div className="d-grid gap-2">
                        <Link
                          to="/admin/user-management/regular-users"
                          className="btn btn-outline-primary text-start d-flex justify-content-between align-items-center py-2 px-3"
                        >
                          <span>Manage Users</span>
                          <i className="bi bi-chevron-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountStatistics;
