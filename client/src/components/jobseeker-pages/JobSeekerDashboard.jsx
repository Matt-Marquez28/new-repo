import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecommendedJobVacancies from "../jobseeker-ui/RecommendedJobVacancies";
import ApplicationList from "../jobseeker-ui/ApplicationList";
import Footer from "../shared-ui/Footer";
import { useUser } from "../../contexts/user.context";
import Search from "../jobseeker-ui/Search";
import SavedJobs from "../jobseeker-ui/SavedJobs";
import JobInvitationList from "../jobseeker-ui/JobInvitationList";
import { useNavigate } from "react-router-dom";
import default_profile from "../../images/default-profile.jpg";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  // Get profile data from the context
  const { user } = useUser();
  const personalInformation = user?.profileData?.personalInformation;
  const jobPreferences = user?.profileData?.jobPreferences;

  // Use localStorage to persist the active tab
  const [activeTab, setActiveTab] = useState(() => {
    // Retrieve the active tab from localStorage, default to "recommendedJobs"
    const savedTab = localStorage.getItem("activeTab");
    return savedTab || "recommendedJobs";
  });

  const handleProfileEditClick = () => {
    navigate("/jobseeker/profile", { state: { activeTab: "personalInfo" } });
  };

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // Automatically scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to handle tab click
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="container">
      <h5 className="my-3 text-primary">
        <i className="bi bi-speedometer"></i> Job Seeker Dashboard
      </h5>
      <div className="alert alert-primary" role="alert">
        <i className="bi bi-info-circle-fill"></i> You’re all set! Complete your{" "}
        <Link className="text-decoration-none" to="/jobseeker/profile">
          profile
        </Link>{" "}
        to start applying for jobs. Best of luck!
      </div>
      <div className="row">
        <div className="col-sm-12 col-xl-9 mb-3">
          <div className="card shadow-sm">
            <div className="card-header">
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "recommendedJobs" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("recommendedJobs")}
                  >
                    <i className="bi bi-hand-thumbs-up-fill"></i> Recommended
                    Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "browseJobs" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("browseJobs")}
                  >
                    <i className="bi bi-search"></i> Browse Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "savedJobs" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("savedJobs")}
                  >
                    <i className="bi bi-bookmark-fill"></i> Saved Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "invitations" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("invitations")}
                  >
                    <i className="bi bi-envelope-paper-fill"></i> Invitations
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      activeTab === "applications" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("applications")}
                  >
                    <i className="bi bi-file-earmark-text-fill"></i>{" "}
                    Applications
                  </Link>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Conditionally render content based on active tab */}
              {activeTab === "recommendedJobs" && <RecommendedJobVacancies />}
              {activeTab === "browseJobs" && <Search />}
              {activeTab === "savedJobs" && <SavedJobs />}
              {activeTab === "invitations" && <JobInvitationList />}
              {activeTab === "applications" && <ApplicationList />}
            </div>
          </div>
        </div>
        <div className="col-sm-12 col-xl-3">
          {/* Profile Card */}
          <div className="card text-center mb-3 shadow-sm jobseeker-card">
            <div className="card-body">
              <h5 className="card-title mb-2 text-primary">
                <i className="bi bi-person-circle"></i> Profile
              </h5>
              <hr />
              <img
                src={
                  user?.profileData?.personalInformation?.photo ||
                  default_profile
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
              <h6 className="my-2 text-body-secondary fw-semibold">
                {`${personalInformation?.firstName} ${personalInformation?.lastName}`}
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-light text-secondary"
                onClick={handleProfileEditClick}
              >
                <i className="bi bi-pencil-square"></i> Edit
              </button>
            </div>
          </div>

          {/* Job Preferences Card */}
          <div className="card text-start mb-4 shadow-sm preferences-card">
            <div className="card-body">
              <h5 className="card-title mb-3 text-center text-primary">
                <i className="bi bi-sliders"></i> Job Preferences
              </h5>
              <hr />

              {/* Preferred Position */}
              <div className="mb-3 px-3 py-2 bg-light rounded  border border-primary border-opacity-25">
                <h6 className="text-secondary my-2">Preferred Positions</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {jobPreferences?.jobPositions?.join(", ") || "Not specified"}
                </p>
              </div>

              {/* Preferred Location */}
              <div className="mb-3 px-3 py-2 bg-light rounded  border border-primary border-opacity-25">
                <h6 className="text-secondary my-2">Preferred Locations</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {jobPreferences?.locations?.join(", ") || "Not specified"}
                </p>
              </div>

              {/* Preferred Employment Type */}
              <div className="mb-3 px-3 py-2 bg-light rounded  border border-primary border-opacity-25">
                <h6 className="text-secondary my-2">Employment Type</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {jobPreferences?.employmentType || "Not specified"}
                </p>
              </div>

              {/* Salary Range */}
              {/* <div className="mb-3 px-3 py-2 bg-light rounded  border border-primary border-opacity-25">
                <h6 className="text-secondary my-2">Salary Expectations</h6>
                <p
                  className="m-0 text-info fw-semibold"
                  style={{ fontSize: "0.85rem" }}
                >
                  {jobPreferences?.salaryMin && jobPreferences?.salaryMax
                    ? `₱${jobPreferences.salaryMin.toLocaleString()} - ₱${jobPreferences.salaryMax.toLocaleString()} ${
                        jobPreferences.salaryType === "monthly"
                          ? "/month"
                          : "/hour"
                      }`
                    : "Not specified"}
                </p>
              </div> */}

              {/* Edit Button */}
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

export default JobSeekerDashboard;
