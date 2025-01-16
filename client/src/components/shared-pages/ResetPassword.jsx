import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants"; // Adjust the path as needed
import { useToast } from "../../contexts/toast.context"; // Adjust the path as needed
import Header from "../shared-ui/Header";
import Footer from "../shared-ui/Footer";

const ResetPassword = () => {
  const { resetToken } = useParams(); // Extract the resetToken from the URL
  const navigate = useNavigate();
  const triggerToast = useToast();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verify the reset token when the component mounts
  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        const res = await axios.post(
          `${ACCOUNT_API_END_POINT}/verify-reset-token`,
          {
            resetToken,
          }
        );

        if (res.data.success) {
          setIsTokenValid(true); // Token is valid
        } else {
          triggerToast("Invalid or expired token.", "danger");
          navigate("/forgot-password", { replace: true }); // Redirect to forgot password page
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        triggerToast("An error occurred while verifying the token.", "danger");
        navigate("/forgot-password", { replace: true }); // Redirect to forgot password page
      }
    };

    verifyResetToken();
  }, [resetToken, navigate, triggerToast]);

  // Handle password reset submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      triggerToast("Passwords do not match.", "danger");
      return;
    }

    try {
      const res = await axios.post(`${ACCOUNT_API_END_POINT}/reset-password`, {
        token: resetToken,
        newPassword,
      });

      if (res.data.success) {
        triggerToast("Password reset successfully.", "success");
        navigate("/login", { replace: true }); // Redirect to login page
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      triggerToast("An error occurred while resetting the password.", "danger");
    }
  };

  return (
    <div className="container">
      <Header />
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <main className="form-signin w-100 m-auto">
            {isTokenValid ? (
              <form
                className="row g-2 needs-validation border p-3 rounded shadow shadow-sm my-3"
                onSubmit={handleSubmit}
              >
                <h3 className="text-center fw-normal fw-bold text-primary">
                  <i className="bi bi-key-fill"> </i>Reset Password
                </h3>

                <hr className="mb-4" />

                {/* New Password */}
                <div className="col-12">
                  <label htmlFor="newPassword" className="form-label">
                    <i className="bi bi-lock-fill"></i> New Password:
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="col-12">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="bi bi-lock-fill"></i> Confirm Password:
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="col-12 mt-5">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  >
                    <i className="bi bi-send-fill me-2"></i> Reset Password
                  </button>
                </div>

                {/* Link to Login */}
                <small className="text-secondary">
                  Remember your password?{" "}
                  <Link className="text-decoration-none" to="/login">
                    Log In
                  </Link>
                </small>
              </form>
            ) : (
              <div className="text-center">
                <p>Verifying token...</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;