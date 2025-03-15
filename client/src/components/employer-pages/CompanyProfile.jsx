import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompanyInformationForm from "../employer-ui/CompanyInformationForm";
import Footer from "../shared-ui/Footer";
import LegalDocuments from "../employer-ui/LegalDocuments";
import AboutUs from "../employer-ui/AboutUs";
import CandidatePreferences from "../employer-ui/CandidatePreferences";
import Accreditation from "../employer-ui/Accreditation";

const CompanyProfile = () => {
  const navigate = useNavigate();

  // Load active tab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("companyProfileActiveTab");
    return savedTab || "companyInformation";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("companyProfileActiveTab", activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="container">
      <div className="d-flex gap-2 my-2 align-items-center">
        <button onClick={() => navigate(-1)} className="btn btn-light">
          <i className="bi bi-arrow-90deg-left"></i>
        </button>
        <h5 className="my-2 text-primary">Company Profile</h5>
      </div>

      <div className="alert alert-primary" role="alert">
        <i className="bi bi-info-circle-fill"></i> Complete each section to
        showcase your brand and job opportunities. A well-detailed profile can
        attract top talent and help job seekers learn more about your company.
      </div>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "companyInformation" ? "active" : ""
                }`}
                onClick={() => handleTabClick("companyInformation")}
              >
                <i className="bi bi-building-fill"></i> Company Info
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "aboutUs" ? "active" : ""
                }`}
                onClick={() => handleTabClick("aboutUs")}
              >
                <i className="bi bi-info-circle-fill"></i> About Us
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "candidatePreferences" ? "active" : ""
                }`}
                onClick={() => handleTabClick("candidatePreferences")}
              >
                <i className="bi bi-gear-fill"></i> Candidate Preferences
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "legalDocuments" ? "active" : ""
                }`}
                onClick={() => handleTabClick("legalDocuments")}
              >
                <i className="bi bi-file-earmark-check-fill"></i> Legal
                Documents
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "accreditation" ? "active" : ""
                }`}
                onClick={() => handleTabClick("accreditation")}
              >
                <i className="bi bi-file-earmark-check-fill"></i> Proof of
                Accreditation
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === "companyInformation" && <CompanyInformationForm />}
          {activeTab === "legalDocuments" && <LegalDocuments />}
          {activeTab === "aboutUs" && <AboutUs />}
          {activeTab === "candidatePreferences" && <CandidatePreferences />}
          {activeTab === "accreditation" && <Accreditation />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompanyProfile;