import React, { useState, useEffect } from "react";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const AboutUs = () => {
  const triggerToast = useToast();
  const [aboutUs, setAboutUs] = useState(null);
  const [formData, setFormData] = useState({
    mission: "",
    vision: "",
    goals: "",
    values: "",
    facebook: "",
    instagram: "",
    twitter: "",
    companyWebsite: "",
  });

  useEffect(() => {
    getCompanyData();
  }, []); // Run once on mount

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      if (res.data?.companyData) {
        setAboutUs(res.data.companyData.aboutUs);
        setFormData({
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

  // handle change
  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  // handle submit
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    console.log(formData);

    try {
      const res = await axios.put(
        `${COMPANY_API_END_POINT}/update-about-us`,
        formData,
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
  };

  return (
    <div className="container">
      {/* Section Title: Company Information */}
      <div className="row align-items-center my-3">
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
        <div className="col-auto">
          <h5 className="position-relative text-primary">
            <i className="bi bi-info-circle-fill"></i> About Us
          </h5>
        </div>
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="mission">
            <h5 className="text-primary">Mission</h5>
          </label>
          <textarea
            id="mission"
            className="form-control"
            rows="4"
            placeholder="Enter your mission statement here"
            value={formData.mission}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="vision">
            <h5 className="text-primary">Vision</h5>
          </label>
          <textarea
            id="vision"
            className="form-control"
            rows="4"
            placeholder="Enter your vision statement here"
            value={formData.vision}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="goals">
            <h5 className="text-primary">Goals</h5>
          </label>
          <textarea
            id="goals"
            className="form-control"
            rows="4"
            placeholder="Enter your goal statement here"
            value={formData.goals}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="values">
            <h5 className="text-primary">Values</h5>
          </label>
          <textarea
            id="values"
            className="form-control"
            rows="4"
            placeholder="Enter your value statement here"
            value={formData.values}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Social Links Inputs */}
        {/* Section Title: Company Information */}
        <div className="row align-items-center my-3">
          <div className="col">
            <hr className="border-2 border-primary" />
          </div>
          <div className="col-auto">
            <h5 className="position-relative text-primary">
              <i className="bi bi-info-circle-fill"></i> Social Links
            </h5>
          </div>
          <div className="col">
            <hr className="border-2 border-primary" />
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
                className="form-control"
                placeholder="Facebook URL"
                value={formData.facebook}
                onChange={handleChange}
              />
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
                className="form-control"
                placeholder="Instagram URL"
                value={formData.instagram}
                onChange={handleChange}
              />
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
                className="form-control"
                placeholder="Twitter URL"
                value={formData.twitter}
                onChange={handleChange}
              />
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
                className="form-control"
                placeholder="Company Website URL"
                value={formData.companyWebsite}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-floppy"></i> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutUs;
