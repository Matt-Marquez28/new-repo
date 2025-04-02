import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../shared-ui/Header";
import Footer from "../shared-ui/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useUser } from "../../contexts/user.context";

const LoginPage = () => {
  const { setUser } = useUser();
  const triggerToast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      emailAddress: "",
      password: "",
    },
    validationSchema: Yup.object({
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
    }),
    onSubmit: async (values) => {
      console.log("Login submitted:", values);
      try {
        const res = await axios.post(`${ACCOUNT_API_END_POINT}/login`, values, {
          withCredentials: true,
        });

        // if account role is a job seeker
        if (res.data.success && res.data.account.role === "jobseeker") {
          // set user in the user context
          setUser(res.data.userData);

          // save user data to local storage
          localStorage.setItem("@user", JSON.stringify(res.data.userData));

          // navigate to job seeker page
          navigate("/jobseeker/dashboard", { replace: true });

          // trigger success popover
          triggerToast(res?.data?.message, "primary");
        }

        // if account role is an employer
        if (res.data.success && res.data.account.role === "employer") {
          // set user in the user context
          setUser(res.data.userData);

          // save user data to local storage
          localStorage.setItem("@user", JSON.stringify(res.data.userData));

          // navigate to employer page
          navigate("/employer/dashboard", { replace: true });

          // trigger success popover
          triggerToast(res?.data?.message, "primary");
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
                <i className="bi bi-box-arrow-in-right"> </i>Log In
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

              {/* Password */}
              <div className="col-12">
                <label htmlFor="password" className="form-label">
                  <i className="bi bi-lock-fill"></i> Password:
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
                    aria-describedby="passwordFeedback"
                    aria-invalid={
                      formik.errors.password && formik.touched.password
                    }
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {formik.errors.password && formik.touched.password && (
                  <div id="passwordFeedback" className="invalid-feedback">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Forgot Password */}
              <small className="text-secondary">
                Forgot Password?{" "}
                <Link className="text-decoration-none" to="/forgot-password">
                  Click Here
                </Link>
              </small>

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
                      Logging In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>{" "}
                      {/* Add your desired Bootstrap icon class here */}
                      Log In
                    </>
                  )}
                </button>
              </div>

              {/* Link to Signup */}
              <small className="text-secondary">
                Don't have an account?{" "}
                <Link className="text-decoration-none" to="/signup">
                  Sign Up
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

export default LoginPage;
