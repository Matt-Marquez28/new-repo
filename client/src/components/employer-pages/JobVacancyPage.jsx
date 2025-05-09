import React, { useState, useEffect } from "react";
import Footer from "../shared-ui/Footer";
import { useNavigate } from "react-router-dom";
import JobVacancyForm from "../employer-ui/JobVacancyForm";
import JobVacancyList from "../employer-ui/JobVacancyList";

const JobVacancyPage = () => {
  const navigate = useNavigate();

  // Load active tab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("jobVacancyActiveTab");
    return savedTab || "postJobVacancy";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jobVacancyActiveTab", activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="container">
      {/* <div className="d-flex gap-2 my-2 align-items-center">
        <button onClick={() => navigate(-1)} className="btn btn-light">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h5 className="my-2" style={{ color: "#1a4798" }}>
          Job Vacancy Management
        </h5>
      </div> */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="">
          <div className="d-flex align-items-center">
            <button
              onClick={() => navigate("/employer/dashboard", { replace: true })}
              className="btn btn-light me-2"
            >
              <i class="bi bi-arrow-left"></i>
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
              <i className="bi bi-suitcase-lg-fill text-white"></i>
            </div>
            <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Job Management
            </h5>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "postJobVacancy" ? "active" : ""
                }`}
                onClick={() => handleTabClick("postJobVacancy")}
              >
                <i className="bi bi-clipboard-fill"></i> Post Job Vacancy
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "jobVacancyList" ? "active" : ""
                }`}
                onClick={() => handleTabClick("jobVacancyList")}
              >
                <i className="bi bi-view-list"></i> Job Vacancy List
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === "postJobVacancy" && <JobVacancyForm />}
          {activeTab === "jobVacancyList" && <JobVacancyList />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobVacancyPage;
