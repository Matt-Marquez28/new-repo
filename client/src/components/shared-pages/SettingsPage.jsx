import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/user.context";

const SettingsPage = () => {
  const { user } = useUser();

  return (
    <div className="container p-3">
      <h4 className="text-primary pt-serif-bold mb-3 mx-1">
        <i className="bi bi-gear-fill"></i> Settings
      </h4>
      <div className="row">
        {/* Card for Changing Password */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-lock-fill text-primary me-2"></i> Change
                Password
              </h5>
              <p className="card-text">
                Ensure your account is secure by updating your password
                regularly.
              </p>
              <Link to="change-password" className="btn btn-primary">
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
