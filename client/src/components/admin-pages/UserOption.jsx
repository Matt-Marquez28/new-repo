import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../shared-ui/Footer";

const UserOption = () => {
  const navigate = useNavigate();

  return (
    <div className="container p-3">
      <h4 className="text-primary mb-3 mx-1">
        <i className="bi bi-people-fill me-2"></i> Manage Users
      </h4>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card text-center shadow-sm border rounded position-relative overflow-hidden">
            {/* Left border accent */}
            <div
              className="position-absolute top-0 start-0 bg-primary h-100"
              style={{ width: "5px" }}
            ></div>

            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-primary">
                <i className="bi bi-people-fill me-2"></i> Manage System Staff
              </h5>
              <p className="card-text text-muted mb-3">
                Manage system staff, add or remove users.
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => navigate("/admin/user-management/system-users")}
              >
                <i className="bi bi-gear-fill me-2"></i> Manage Staff
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center shadow-sm border rounded position-relative overflow-hidden">
            {/* Left border accent */}
            <div
              className="position-absolute top-0 start-0 bg-primary h-100"
              style={{ width: "5px" }}
            ></div>

            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-primary">
                <i className="bi bi-person-badge-fill me-2"></i> Manage System
                Users
              </h5>
              <p className="card-text text-muted mb-3">
                Manage employers and applicants, ban or delete users.
              </p>
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => navigate("/admin/user-management/regular-users")}
              >
                <i className="bi bi-person-x-fill me-2"></i> Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOption;
