import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../shared-ui/Header";
import Footer from "../shared-ui/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const SignupPage = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      role: "",
      firstName: "",
      lastName: "",
      mobileNumber: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      role: Yup.string().required("Please select your role."),
      firstName: Yup.string().required("First name is required."),
      lastName: Yup.string().required("Last name is required."),
      mobileNumber: Yup.string()
        .matches(
          /^(09|\+639)\d{9}$/,
          "Please enter a valid 10-digit mobile number."
        )
        .required("Mobile number is required."),
      emailAddress: Yup.string()
        .email("Invalid email address.")
        .matches(
          /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
          "Please enter a valid email address"
        )
        .required("Email is required."),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters long.")
        .required("Password is required."),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match.")
        .required("Please confirm your password."),
    }),
    onSubmit: async (values) => {
      // Navigate to the verification page with state
      navigate("/verification", { state: { signupData: values } });
    },
  });

  return (
    <div className="container">
      <Header />
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <main className="form-signin w-100 m-auto">
            <form
              className="row g-2 needs-validation border p-3 rounded shadow shadow-sm my-3"
              onSubmit={formik.handleSubmit}
            >
              <h3 className="text-center fw-normal fw-bold text-primary">
                Create your account
              </h3>
              <hr className="mb-4" />
              {/* First Name */}
              <div className="col-6">
                <label htmlFor="firstName" className="form-label">
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`form-control ${
                    formik.errors.firstName && formik.touched.firstName
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("firstName")}
                />
                {formik.errors.firstName && formik.touched.firstName && (
                  <div className="invalid-feedback">
                    {formik.errors.firstName}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="col-6">
                <label htmlFor="lastName" className="form-label">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`form-control ${
                    formik.errors.lastName && formik.touched.lastName
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("lastName")}
                />
                {formik.errors.lastName && formik.touched.lastName && (
                  <div className="invalid-feedback">
                    {formik.errors.lastName}
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div className="col-12">
                <label htmlFor="mobileNumber" className="form-label">
                  Mobile Number:
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  className={`form-control ${
                    formik.errors.mobileNumber && formik.touched.mobileNumber
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("mobileNumber")}
                />
                {formik.errors.mobileNumber && formik.touched.mobileNumber && (
                  <div className="invalid-feedback">
                    {formik.errors.mobileNumber}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="col-12">
                <label htmlFor="emailAddress" className="form-label">
                  Email Address:
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  className={`form-control ${
                    formik.errors.emailAddress && formik.touched.emailAddress
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("emailAddress")}
                />
                {formik.errors.emailAddress && formik.touched.emailAddress && (
                  <div className="invalid-feedback">
                    {formik.errors.emailAddress}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="col-12">
                <label htmlFor="password" className="form-label">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${
                    formik.errors.password && formik.touched.password
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("password")}
                />
                {formik.errors.password && formik.touched.password && (
                  <div className="invalid-feedback">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="col-12">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-control ${
                    formik.errors.confirmPassword &&
                    formik.touched.confirmPassword
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

              {/* Role Selection */}
              <div className="col-12">
                <label className="form-label">Role:</label>
                <div className="d-flex align-items-center">
                  <div className="form-check me-3">
                    <input
                      className={`form-check-input ${
                        formik.errors.role && formik.touched.role
                          ? "is-invalid"
                          : ""
                      }`}
                      type="radio"
                      name="role"
                      id="jobseeker"
                      value="jobseeker"
                      onChange={formik.handleChange}
                      checked={formik.values.role === "jobseeker"}
                    />
                    <label className="form-check-label" htmlFor="jobseeker">
                      Jobseeker
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${
                        formik.errors.role && formik.touched.role
                          ? "is-invalid"
                          : ""
                      }`}
                      type="radio"
                      name="role"
                      id="employer"
                      value="employer"
                      onChange={formik.handleChange}
                      checked={formik.values.role === "employer"}
                    />
                    <label className="form-check-label" htmlFor="employer">
                      Employer
                    </label>
                  </div>
                </div>
                {formik.errors.role && formik.touched.role && (
                  <div className="invalid-feedback d-block">
                    {formik.errors.role}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-12 mt-5">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>

              {/* Link to Login */}
              <small className="text-secondary">
                Already have an account?{" "}
                <Link className="text-decoration-none" to="/login">
                  Login
                </Link>
              </small>
            </form>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;