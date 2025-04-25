import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../shared-ui/Header";
import Footer from "../shared-ui/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap Modal

const SignupPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (!isAgreed) {
        alert("You must agree to the Terms and Conditions before signing up.");
        return;
      }
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
              className="row g-2 needs-validation border p-3 rounded shadow my-3"
              onSubmit={formik.handleSubmit}
            >
              <h3 className="text-center fw-bold" style={{ color: "#1a4798" }}>
                <i className="bi bi-pen"></i> Create your account
              </h3>
              <hr className="mb-4" />

              {/* Role Selection */}
              <div className="col-12">
                <label htmlFor="role" className="form-label">
                  Role:
                </label>
                <select
                  id="role"
                  className={`form-control ${
                    formik.errors.role && formik.touched.role
                      ? "is-invalid"
                      : ""
                  }`}
                  {...formik.getFieldProps("role")}
                >
                  <option value="">Select your role</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
                {formik.errors.role && formik.touched.role && (
                  <div className="invalid-feedback">{formik.errors.role}</div>
                )}
              </div>

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
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`form-control ${
                      formik.errors.password && formik.touched.password
                        ? "is-invalid"
                        : ""
                    }`}
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                  {formik.errors.password && formik.touched.password && (
                    <div className="invalid-feedback">
                      {formik.errors.password}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="col-12">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password:
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={`form-control ${
                      formik.errors.confirmPassword &&
                      formik.touched.confirmPassword
                        ? "is-invalid"
                        : ""
                    }`}
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                  {formik.errors.confirmPassword &&
                    formik.touched.confirmPassword && (
                      <div className="invalid-feedback">
                        {formik.errors.confirmPassword}
                      </div>
                    )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="col-12">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <label htmlFor="agreeTerms" className="ms-2">
                  I agree to the{" "}
                  <span
                    className="text-primary text-decoration-underline"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowModal(true)}
                  >
                    Terms and Conditions
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="col-12 mt-3">
                <button
                  type="submit"
                  className="btn w-100 text-white"
                  style={{ backgroundColor: "#1a4798" }}
                  disabled={!isAgreed}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>

      <Footer />

      {/* Terms and Conditions Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <h5>Acceptance of Terms</h5>
          <p>
            By creating an account or using the services provided by the PESO
            Job Portal, users (including job seekers, employers, and
            administrators) agree to comply with these Terms and Conditions. If
            you do not agree to any part of these terms, you must not access or
            use the system.
          </p>

          <h5>Account Registration and Responsibilities</h5>
          <ul>
            <li>
              Users must provide accurate and complete information during
              registration.
            </li>
            <li>
              Employers are responsible for submitting valid and authentic
              accreditation documents, such as DTI/SEC registration, BIR TIN,
              and business permits.
            </li>
            <li>
              Any unauthorized use of an account must be reported immediately to
              the administrators.
            </li>
          </ul>

          <h5>Use of the System</h5>
          <ul>
            <li>
              The system is designed solely for employment-related purposes: job
              posting, job seeking, employer accreditation, and PESO
              administrative functions.
            </li>
            <li>
              Users must not use the platform for fraudulent, illegal, or
              harmful activities.
            </li>
            <li>
              Job seekers must only apply for jobs they are qualified for and
              avoid submitting misleading resumes.
            </li>
            <li>
              Employers must post only legitimate job offers and are prohibited
              from any form of misrepresentation or exploitation.
            </li>
          </ul>

          <h5>Document Verification and Accreditation</h5>
          <ul>
            <li>
              All submitted documents are subject to manual verification by the
              PESO administrators.
            </li>
            <li>
              The system reserves the right to revoke accreditation or restrict
              access if documents are found to be expired, tampered with, or
              fake.
            </li>
            <li>
              Certificates of accreditation are only visible to verified
              employers and may be hidden or disabled once accreditation becomes
              invalid.
            </li>
          </ul>

          <h5>Notification System</h5>
          <ul>
            <li>
              Users will receive important system updates, job postings, and
              account-related notifications through in-system alerts and, where
              applicable, through registered email addresses.
            </li>
          </ul>

          <h5>Data Privacy</h5>
          <ul>
            <li>
              All personal and company data submitted to the system will be
              handled in accordance with the Data Privacy Act of 2012.
            </li>
            <li>
              Information will only be used for employment facilitation and
              system management and will not be shared with third parties
              without consent.
            </li>
          </ul>

          <h5>System Availability</h5>
          <ul>
            <li>
              While efforts will be made to ensure system availability, the
              administrators reserve the right to suspend or modify system
              access for maintenance or updates.
            </li>
            <li>
              PESO Taguig City is not liable for data loss due to unexpected
              technical issues or external factors.
            </li>
          </ul>

          <h5>Termination and Suspension</h5>
          <ul>
            <li>
              Users who violate any part of these Terms and Conditions may have
              their accounts suspended or permanently removed from the system.
            </li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignupPage;
