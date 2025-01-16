import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../shared-ui/Header";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const VerificationPage = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve signup data from state
  const { signupData } = location.state || {};

  // Timer state
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInitialOTP = async () => {
      try {
        const res = await axios.post(`${ACCOUNT_API_END_POINT}/generate-otp`, {
          emailAddress: signupData.emailAddress,
        });

        if (res.data.success) {
          triggerToast(
            "A new OTP has been sent to your email address.",
            "primary"
          );
          setTimer(60);
          setIsTimerActive(true);
        }
      } catch (error) {
        console.log(error);
        triggerToast("Failed to generate OTP. Please try again.", "danger");
      } finally {
        setIsLoading(false);
      }
    };

    generateInitialOTP();
  }, []);

  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
  }, [isTimerActive, timer]);

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${ACCOUNT_API_END_POINT}/generate-otp`, {
        emailAddress: signupData.emailAddress,
      });

      if (res.data.success) {
        triggerToast(
          "A new OTP has been sent to your email address.",
          "primary"
        );
        setTimer(60);
        setIsTimerActive(true);
      }
    } catch (error) {
      console.log(error);
      triggerToast("Failed to resend OTP. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, "OTP must be exactly 6 digits.")
        .required("OTP is required."),
    }),
    onSubmit: async (values) => {
      console.log("OTP submitted:", values);
      try {
        const res = await axios.post(
          `${ACCOUNT_API_END_POINT}/verify-otp`,
          {
            otp: values.otp,
            emailAddress: signupData.emailAddress,
          },
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          // Call the signup endpoint after successful OTP verification
          const signupRes = await axios.post(
            `${ACCOUNT_API_END_POINT}/signup`,
            signupData,
            {
              withCredentials: true,
            }
          );

          if (signupRes.data.success) {
            // Navigate to the next page after successful signup
            navigate("/login", { replace: true });
            triggerToast(signupRes?.data?.message, "primary");
          } else {
            triggerToast(signupRes?.data?.message, "danger");
          }
        } else {
          triggerToast(res?.data?.message, "danger");
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
            {isLoading ? (
              <div className="d-flex flex-column align-items-center my-5">
                <div className="mb-3">
                  <h3 className="text-primary">Generating OTP</h3>
                </div>
                <div className="d-flex justify-content-center">
                  <div className="spinner-grow text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-info mx-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="spinner-grow text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="row g-2 needs-validation border p-3 rounded shadow shadow-sm my-3"
                onSubmit={formik.handleSubmit}
              >
                <h3 className="text-center fw-normal fw-bold text-primary">
                  <i className="bi bi-shield-lock-fill"> </i>OTP Verification
                </h3>

                <hr />
                <div className="alert alert-info py-2" role="alert">
                  <i className="bi bi-info-circle-fill"></i> Please enter the
                  6-digit OTP sent to your email address:{" "}
                  <strong>{signupData.emailAddress}</strong>
                </div>

                {/* OTP */}
                <div className="col-12">
                  <label htmlFor="otp" className="form-label">
                    <i className="bi bi-key-fill"></i> Enter OTP:
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className={`form-control ${
                      formik.errors.otp && formik.touched.otp
                        ? "is-invalid"
                        : ""
                    }`}
                    aria-describedby="otpFeedback"
                    aria-invalid={formik.errors.otp && formik.touched.otp}
                    {...formik.getFieldProps("otp")}
                  />
                  {formik.errors.otp && formik.touched.otp && (
                    <div id="otpFeedback" className="invalid-feedback">
                      {formik.errors.otp}
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock-fill me-2"></i> Verify
                        OTP
                      </>
                    )}
                  </button>
                  {isTimerActive && (
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Please wait {timer} seconds before resending OTP.
                      </small>
                    </div>
                  )}
                </div>

                {/* Resend OTP Button */}
                {!isTimerActive && (
                  <div className="col-12 mt-3 text-center">
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={handleResendOTP}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
