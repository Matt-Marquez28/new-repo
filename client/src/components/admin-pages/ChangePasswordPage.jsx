import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useUser } from "../../contexts/user.context";

const ChangePasswordPage = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required."),
      newPassword: Yup.string()
        .min(8, "New password must be at least 8 characters long.")
        .required("New password is required."),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match.")
        .required("Please confirm your new password."),
    }),
    onSubmit: async (values) => {
      console.log("Change Password submitted:", values);
      try {
        const res = await axios.post(
          `${ACCOUNT_API_END_POINT}/change-password`,
          values,
          { withCredentials: true }
        );

        if (res.data.success) {
          triggerToast(res?.data?.message, "success");
          navigate("/admin/settings", { replace: true });
        }
      } catch (error) {
        console.log(error);
        triggerToast(error?.response?.data?.message, "danger");
      }
    },
  });

  return (
    <div className="d-flex align-items-center justify-content-center">
      <div
        className="card shadow-sm p-4 rounded mt-5"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h3 className="text-center text-primary mb-4">
          <i className="bi bi-key-fill"></i> Change Password
        </h3>
        <form onSubmit={formik.handleSubmit}>
          {/* Current Password */}
          <div className="mb-3">
            <label htmlFor="currentPassword" className="form-label">
              <i className="bi bi-lock-fill"></i> Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className={`form-control ${
                formik.errors.currentPassword && formik.touched.currentPassword
                  ? "is-invalid"
                  : ""
              }`}
              {...formik.getFieldProps("currentPassword")}
            />
            {formik.errors.currentPassword &&
              formik.touched.currentPassword && (
                <div className="invalid-feedback">
                  {formik.errors.currentPassword}
                </div>
              )}
          </div>

          {/* New Password */}
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              <i className="bi bi-lock-fill"></i> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className={`form-control ${
                formik.errors.newPassword && formik.touched.newPassword
                  ? "is-invalid"
                  : ""
              }`}
              {...formik.getFieldProps("newPassword")}
            />
            {formik.errors.newPassword && formik.touched.newPassword && (
              <div className="invalid-feedback">
                {formik.errors.newPassword}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="bi bi-lock-fill"></i> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`form-control ${
                formik.errors.confirmPassword && formik.touched.confirmPassword
                  ? "is-invalid"
                  : ""
              }`}
              {...formik.getFieldProps("confirmPassword")}
            />
            {formik.errors.confirmPassword &&
              formik.touched.confirmPassword && (
                <div className="invalid-feedback">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <span
                  className="spinner-grow spinner-grow-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
