import React, { useState, useEffect } from "react";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useFormik } from "formik";
import * as Yup from "yup";

const AboutUs = () => {
  const triggerToast = useToast();
  const [aboutUs, setAboutUs] = useState(null);

  // Fetch company data on mount
  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      if (res.data?.companyData) {
        setAboutUs(res.data.companyData.aboutUs);
        // Set initial values for Formik
        formik.setValues({
          mission: res.data.companyData.aboutUs?.mission || "",
          vision: res.data.companyData.aboutUs?.vision || "",
          goals: res.data.companyData.aboutUs?.goals || "",
          values: res.data.companyData.aboutUs?.values || "",
          facebook: res.data.companyData.aboutUs?.facebook || "",
          instagram: res.data.companyData.aboutUs?.instagram || "",
          twitter: res.data.companyData.aboutUs?.twitter || "",
          companyWebsite: res.data.companyData.aboutUs?.companyWebsite || "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      mission: "",
      vision: "",
      goals: "",
      values: "",
      facebook: "",
      instagram: "",
      twitter: "",
      companyWebsite: "",
    },
    validationSchema: Yup.object({
      facebook: Yup.string()
        .url("Must be a valid URL")
        .test(
          "is-facebook",
          "URL must be from Facebook (e.g., https://facebook.com/...)",
          (value) => !value || value.includes("facebook.com")
        ),
      instagram: Yup.string()
        .url("Must be a valid URL")
        .test(
          "is-instagram",
          "URL must be from Instagram (e.g., https://instagram.com/...)",
          (value) => !value || value.includes("instagram.com")
        ),
      twitter: Yup.string()
        .url("Must be a valid URL")
        .test(
          "is-twitter",
          "URL must be from Twitter (e.g., https://twitter.com/...)",
          (value) => !value || value.includes("twitter.com")
        ),
      companyWebsite: Yup.string().url("Must be a valid URL"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.put(
          `${COMPANY_API_END_POINT}/update-about-us`,
          values,
          {
            withCredentials: true,
          }
        );
        triggerToast(res?.data?.message, "primary");
        getCompanyData();
      } catch (error) {
        console.log(error);
        triggerToast(error?.response?.data?.message, "danger");
      }
    },
  });

  return (
    <div className="container">
      {/* Section Title: Company Information */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="">
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#1a4798",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <i className="bi bi-info-circle text-white"></i>
            </div>
            <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              About Us
            </h5>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="row">
          {/* Mission and Vision in the first column */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="mission">Mission</label>
              <textarea
                id="mission"
                className="form-control"
                rows="6"
                placeholder="Enter your mission statement here"
                {...formik.getFieldProps("mission")}
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="vision">Vision</label>
              <textarea
                id="vision"
                className="form-control"
                rows="6"
                placeholder="Enter your vision statement here"
                {...formik.getFieldProps("vision")}
              ></textarea>
            </div>
          </div>

          {/* Goals and Values in the second column */}
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="goals">Goals</label>
              <textarea
                id="goals"
                className="form-control"
                rows="6"
                placeholder="Enter your goal statement here"
                {...formik.getFieldProps("goals")}
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="values">Values</label>
              <textarea
                id="values"
                className="form-control"
                rows="6"
                placeholder="Enter your value statement here"
                {...formik.getFieldProps("values")}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Social Links Inputs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
          <div className="">
            <div className="d-flex align-items-center">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#1a4798",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                }}
              >
                <i className="bi bi-link-45deg text-white"></i>
              </div>
              <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                Social Links
              </h5>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="facebook">Facebook</label>
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1">
                <i className="bi bi-facebook"></i>
              </span>
              <input
                type="text"
                id="facebook"
                className={`form-control ${
                  formik.touched.facebook && formik.errors.facebook
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Facebook URL"
                {...formik.getFieldProps("facebook")}
              />
              {formik.touched.facebook && formik.errors.facebook ? (
                <div className="invalid-feedback">{formik.errors.facebook}</div>
              ) : null}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="instagram">Instagram</label>
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1">
                <i className="bi bi-instagram"></i>
              </span>
              <input
                type="text"
                id="instagram"
                className={`form-control ${
                  formik.touched.instagram && formik.errors.instagram
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Instagram URL"
                {...formik.getFieldProps("instagram")}
              />
              {formik.touched.instagram && formik.errors.instagram ? (
                <div className="invalid-feedback">
                  {formik.errors.instagram}
                </div>
              ) : null}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="twitter">Twitter</label>
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1">
                <i className="bi bi-twitter"></i>
              </span>
              <input
                type="text"
                id="twitter"
                className={`form-control ${
                  formik.touched.twitter && formik.errors.twitter
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Twitter URL"
                {...formik.getFieldProps("twitter")}
              />
              {formik.touched.twitter && formik.errors.twitter ? (
                <div className="invalid-feedback">{formik.errors.twitter}</div>
              ) : null}
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="companyWebsite">Company Website</label>
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1">
                <i className="bi bi-globe"></i>
              </span>
              <input
                type="text"
                id="companyWebsite"
                className={`form-control ${
                  formik.touched.companyWebsite && formik.errors.companyWebsite
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="Company Website URL"
                {...formik.getFieldProps("companyWebsite")}
              />
              {formik.touched.companyWebsite && formik.errors.companyWebsite ? (
                <div className="invalid-feedback">
                  {formik.errors.companyWebsite}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
          >
            <i className="bi bi-floppy"></i> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutUs;
