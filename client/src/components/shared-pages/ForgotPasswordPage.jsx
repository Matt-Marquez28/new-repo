import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../shared-ui/Header";
import Footer from "../shared-ui/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const ForgotPasswordPage = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      emailAddress: "",
    },
    validationSchema: Yup.object({
      emailAddress: Yup.string()
        .email("Invalid email address.")
        .matches(
          /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
          "Please enter a valid email address"
        )
        .required("Email is required."),
    }),
    onSubmit: async (values) => {
      console.log("Forgot Password submitted:", values);
      try {
        const res = await axios.post(
          `${ACCOUNT_API_END_POINT}/forgot-password`,
          values
        );

        if (res.data.success) {
          // Trigger success popover
          triggerToast(res?.data?.message, "success");

          // Navigate to the login page or a confirmation page
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.log(error);
        triggerToast(error?.response?.data?.message, "danger");
      }
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
                <i className="bi bi-key-fill"> </i>Forgot Password
              </h3>

              <hr className="mb-4" />

              {/* Email */}
              <div className="col-12">
                <label htmlFor="emailAddress" className="form-label">
                  <i className="bi bi-envelope-fill"></i> Email Address:
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  className={`form-control ${
                    formik.errors.emailAddress && formik.touched.emailAddress
                      ? "is-invalid"
                      : ""
                  }`}
                  aria-describedby="emailAddressFeedback"
                  aria-invalid={
                    formik.errors.emailAddress && formik.touched.emailAddress
                  }
                  {...formik.getFieldProps("emailAddress")}
                />
                {formik.errors.emailAddress && formik.touched.emailAddress && (
                  <div id="emailAddressFeedback" className="invalid-feedback">
                    {formik.errors.emailAddress}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-12 mt-5">
                <button
                  type="submit"
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span
                        className="spinner-grow spinner-grow-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-2"></i>{" "}
                      {/* Add your desired Bootstrap icon class here */}
                      Send Reset Link
                    </>
                  )}
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
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;