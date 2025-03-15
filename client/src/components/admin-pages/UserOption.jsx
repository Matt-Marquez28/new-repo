import React from "react";
import { useNavigate } from "react-router-dom";

const UserOption = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card text-center shadow-sm border-0 rounded">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-primary">
                <i className="bi bi-people-fill me-2"></i> System User
                Management
              </h5>
              <p className="card-text text-muted">
                Manage system staff, add or remove users.
              </p>
              <button className="btn btn-outline-primary rounded px-4" onClick={() => navigate("/admin/user-management/system-users")}>
                <i className="bi bi-gear-fill me-2"></i> Manage Staff
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card text-center shadow-sm border-0 rounded">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold text-danger">
                <i className="bi bi-person-badge-fill me-2"></i> Regular User
                Management
              </h5>
              <p className="card-text text-muted">
                Manage employers and applicants, ban or delete users.
              </p>
              <button className="btn btn-outline-danger rounded px-4" onClick={() => navigate("/admin/user-management/regular-users")}>
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
