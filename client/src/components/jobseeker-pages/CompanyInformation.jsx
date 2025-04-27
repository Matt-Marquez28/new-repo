import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import Footer from "../shared-ui/Footer";
import CompanyInformation from "../jobseeker-ui/CompanyInformation";
import CompanyJobVacanciesList from "../jobseeker-ui/CompanyJobVacanciesList";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [activeTab, setActiveTab] = useState("companyInformation");
  const [company, setCompany] = useState(null);

  useEffect(() => {
    getCompanyDataById();
  }, []);

  const getCompanyDataById = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-company-data-by-id/${companyId}`
      );
      setCompany(res?.data?.companyData);
      console.log(res?.data?.companyData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="">
          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn btn-light text-dark me-2"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
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
              <i className="bi bi-speedometer text-white"></i>
            </div>
            <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Company Details
            </h5>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "companyInformation" ? "active" : ""
                }`}
                onClick={() => setActiveTab("companyInformation")}
              >
                <i className="bi bi-building-fill"></i> Company Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "jobVacancies" ? "active" : ""
                }`}
                onClick={() => setActiveTab("jobVacancies")}
              >
                <i className="bi bi-suitcase-lg-fill"></i> Job Vacancies
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {activeTab === "companyInformation" && (
            <CompanyInformation company={company} />
          )}

          {activeTab === "jobVacancies" && (
            <CompanyJobVacanciesList
              companyId={companyId}
              companyName={company?.companyInformation?.businessName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
