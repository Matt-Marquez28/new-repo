import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApplicantList from "../employer-ui/ApplicantList";
import Footer from "../shared-ui/Footer";
import imagePath from "./vecteezy_empty-state-data-not-found-illustration_46952344.jpg";
import RecommendedJobSeekers from "../employer-ui/RecommendedJobSeekers";
import SearchJobSeekers from "../employer-ui/SearchJobSeekers";
import { useUser } from "../../contexts/user.context";
import JobInvitationList from "../employer-ui/JobInvitationList";
import default_company from "../../images/default-company.jpg";

const EmployerDashboard = () => {
  const { user } = useUser();
  const candidatePreferences = user?.companyData?.candidatePreferences;

  // Load active tab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("employerActiveTab");
    return savedTab || "recommendedApplicants";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("employerActiveTab", activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "incomplete":
        return {
          className: "badge bg-light text-secondary",
          icon: "bi bi-exclamation-circle-fill text-secondary",
        };
      case "pending":
        return {
          className: "badge bg-light text-warning",
          icon: "bi bi-hourglass-split text-warning",
        };
      case "accredited":
        return {
          className: "badge bg-light text-success",
          icon: "bi bi-check-circle-fill text-success",
        };
      case "declined":
        return {
          className: "badge bg-light text-danger",
          icon: "bi bi-x-circle-fill text-danger",
        };
      case "revoked":
        return {
          className: "badge bg-light text-dark",
          icon: "bi bi-slash-circle-fill text-secondary",
        };
      default:
        return {
          className: "badge bg-light text-secondary",
          icon: "bi bi-info-circle-fill",
        };
    }
  };

  const statusBadge = getStatusBadge(user?.companyData?.status);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="my-3 text-primary">
          <i className="bi bi-speedometer"></i> Employer Dashboard
        </h5>
        <div className="d-flex align-items-center">
          <span
            className={`${statusBadge.className} d-flex align-items-center p-2`}
          >
            <i
              className={`${statusBadge.icon} me-2`}
              style={{ fontSize: "1.25rem" }}
            ></i>
            {user?.companyData?.status || "incomplete"}
          </span>
        </div>
      </div>

      <div className="alert alert-primary" role="alert">
        <i className="bi bi-info-circle-fill"></i> You’re all set! Complete your{" "}
        <Link className="text-decoration-none" to="/employer/company-profile">
          Company Profile
        </Link>{" "}
        and submit{" "}
        <Link to="/employer/company-profile" className="text-decoration-none">
          Legal Documents
        </Link>{" "}
        to start posting job vacancies!
      </div>

      <div className="row">
        <div className="col-sm-12 col-xl-9 mb-3">
          <div className="card shadow-sm">
            <div className="card-header">
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "recommendedApplicants" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("recommendedApplicants")}
                  >
                    <i className="bi bi-hand-thumbs-up-fill"></i> Recommendation
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "browseJobs" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("browseJobs")}
                  >
                    <i className="bi bi-search"></i> Browse
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "invitations" ? "active" : ""
                    } ${
                      user?.companyData?.status !== "accredited"
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() =>
                      user?.companyData?.status === "accredited" &&
                      handleTabClick("invitations")
                    }
                  >
                    <i className="bi bi-envelope-paper-fill"></i> Invitations
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "applicants" ? "active" : ""
                    } ${
                      user?.companyData?.status !== "accredited"
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() =>
                      user?.companyData?.status === "accredited" &&
                      handleTabClick("applicants")
                    }
                  >
                    <i className="bi bi-people-fill"></i> Applicants
                  </Link>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {activeTab === "recommendedApplicants" && (
                <div>
                  <RecommendedJobSeekers />
                </div>
              )}

              {activeTab === "browseJobs" && <SearchJobSeekers />}
              {activeTab === "invitations" && <JobInvitationList />}
              {activeTab === "applicants" && <ApplicantList />}
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-xl-3">
          <div className="card shadow-sm text-center mb-3">
            <div className="card-body">
              <h5 className="card-title mb-2 text-primary">
                <i className="bi bi-building-fill"></i> Company Profile
              </h5>
              <hr />
              <img
                src={
                  user?.companyData?.companyInformation?.companyLogo ||
                  default_company
                }
                className="border shadow-sm"
                alt="Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
              <h6 className="card-subtitle my-2 text-body-secondary">
                {user?.companyData?.companyInformation?.businessName}
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-light text-secondary"
              >
                <i className="bi bi-pencil-square"></i> Edit
              </button>
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 d-flex align-items-center justify-content-center text-primary">
                <i className="bi bi-sliders me-2"></i> Preferences
              </h5>
            </div>
            <div className="card-body pt-0">
              {/* Specializations */}
              <div className="mb-3 px-3 py-2 bg-light rounded">
                <h6 className="text-secondary my-2">Specializations</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {candidatePreferences?.specializations?.length > 0 ? (
                    candidatePreferences.specializations.join(", ")
                  ) : (
                    <span className="text-info">Not specified</span>
                  )}
                </p>
              </div>

              {/* Skills */}
              <div className="mb-3 px-3 py-2 bg-light rounded">
                <h6 className="text-secondary my-2">Skills</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {candidatePreferences?.skills?.length > 0 ? (
                    candidatePreferences.skills.join(", ")
                  ) : (
                    <span className="text-info">Not specified</span>
                  )}
                </p>
              </div>

              {/* Educational Levels */}
              <div className="mb-3 px-3 py-2 bg-light rounded">
                <h6 className="text-secondary my-2">Educational Levels</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {candidatePreferences?.educationalLevels?.length > 0 ? (
                    candidatePreferences.educationalLevels.join(", ")
                  ) : (
                    <span className="text-info">Not specified</span>
                  )}
                </p>
              </div>

              {/* Edit Button - Original Style */}
              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light text-secondary"
                >
                  <i className="bi bi-pencil-square"></i> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployerDashboard;
