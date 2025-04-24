import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../shared-ui/Footer";

const UserOption = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3">
          <div className="d-flex align-items-center">
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
              <i className="bi bi-people-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              User Management
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Verify company credentials and manage approval status
          </p>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-6">
          <div
            className="card text-center shadow-sm  rounded-3 position-relative overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderLeft: "4px solid #1a4798",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="card-body p-4">
              <h5 className="card-title fw-bold" style={{ color: "#1a4798" }}>
                <i className="bi bi-people-fill me-2"></i> Manage Administrator
                / Staff
              </h5>
              <p className="card-text text-muted mb-3">
                Manage system admin and staff, add or remove accounts.
              </p>
              <button
                className="btn rounded px-4 text-white"
                style={{ backgroundColor: "#1a4798" }}
                onClick={() => navigate("/admin/user-management/system-users")}
              >
                <i className="bi bi-gear-fill me-2"></i> Manage Administrator /
                Staff Accounts
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div
            className="card text-center shadow-sm rounded-3 position-relative overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderLeft: "4px solid #1a4798",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="card-body p-4">
              <h5 className="card-title fw-bold" style={{ color: "#1a4798" }}>
                <i className="bi bi-person-badge-fill me-2"></i> Manage System
                Users
              </h5>
              <p className="card-text text-muted mb-3">
                Manage employers and jobseekers, ban or delete account.
              </p>
              <button
                className="btn rounded px-4 text-white"
                style={{ backgroundColor: "#1a4798" }}
                onClick={() => navigate("/admin/user-management/regular-users")}
              >
                <i className="bi bi-person-x-fill me-2"></i> Manage Employer /
                Jobseeker Accounts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOption;
