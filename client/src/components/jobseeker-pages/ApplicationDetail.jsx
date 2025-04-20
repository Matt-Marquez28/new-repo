import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import Footer from "../shared-ui/Footer";
import axios from "axios";
import ProgressBar from "react-bootstrap/ProgressBar";
import Hire_Decline from "../jobseeker-ui/Hire_Decline";
import InterviewSchedule from "../jobseeker-ui/InterviewSchedule";
import default_profile from "../../images/default-profile.jpg";

const ApplicationDetail = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("interviewSchedule");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    getApplication();
  }, []);

  const getApplication = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/get-application/${applicationId}`
      );
      setApplication(res?.data?.application);
      console.log(res?.data?.application);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusProgressBar = (status) => {
    let progressProps;

    switch (status) {
      case "pending":
        progressProps = {
          variant: "warning",
          now: 25,
          animated: true,
        };
        break;
      case "interview scheduled":
        progressProps = {
          variant: "info",
          now: 50,
          animated: true,
        };
        break;
      case "interview completed":
        progressProps = {
          variant: "info",
          now: 75,
          animated: true,
        };
        break;
      case "hired":
        progressProps = {
          variant: "primary",
          now: 100,
          animated: true,
        };
        break;
      default:
        progressProps = {
          variant: "secondary",
          now: 0,
          animated: false,
        };
    }

    return <ProgressBar {...progressProps} style={{ height: "8px" }} />;
  };

  return (
    <div className="container">
      <div className="d-flex my-2 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-light text-dark"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <h5 className="my-2" style={{ color: "#1a4798" }}>
            Application for {application?.jobVacancyId?.jobTitle}
          </h5>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          {/* overview card */}
          <div className="card shadow-sm mb-3">
            <div
              className="card-header text-center fw-normal text-light"
              style={{ backgroundColor: "#1a4798" }}
            >
              Overview
            </div>
            <div className="card-body">
              <div className="text-center">
                {/* Photo Section - Hidden on medium screens */}
                <div className="d-none d-md-block">
                  <img
                    src={
                      application?.jobSeekerId?.personalInformation?.photo ||
                      default_profile
                    }
                    className="border"
                    alt="Avatar"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                {/* Name Section - Visible on all screens */}
                <h5 className="my-2 fw-bold" style={{ color: "#555555" }}>
                  {`${application?.jobSeekerId?.personalInformation?.firstName} ${application?.jobSeekerId?.personalInformation?.lastName}`}
                </h5>
                <p
                  className="text-secondary m-0"
                  style={{ fontSize: "0.85rem" }}
                >
                  {application?.jobSeekerId?.skillsAndSpecializations?.specializations.map(
                    (specialization, index) => (
                      <span key={index} className="badge bg-info me-1">
                        {specialization}
                      </span>
                    )
                  )}
                </p>

                <hr />

                {/* Hiring Progress Section - Always Visible */}
                <div className="p-3 border rounded bg-light">
                  <h5 className="mb-3" style={{ color: "#1a4798" }}>
                    Hiring Progress
                  </h5>
                  {getStatusProgressBar(application?.status)}
                  <span
                    className="fw-semibold text-muted"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {application?.status}
                  </span>
                </div>

                <hr />

                {/* Contact Section - Always Visible */}
                <div className="p-3 border rounded mb-3 bg-light">
                  <h5 className="mb-3" style={{ color: "#1a4798" }}>
                    Contact
                  </h5>
                  <div className="d-flex text-start align-items-center gap-3 mb-3">
                    <div>
                      <i className="bi bi-envelope-fill fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <div className="small">Email</div>
                      <div className="text-secondary small">
                        {
                          application?.jobSeekerId?.personalInformation
                            ?.emailAddress
                        }
                      </div>
                    </div>
                  </div>

                  <div className="d-flex text-start align-items-center gap-3 mb-3">
                    <div>
                      <i className="bi bi-phone-fill fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <div className="small">Mobile No.</div>
                      <div className="text-secondary small">
                        {
                          application?.jobSeekerId?.personalInformation
                            ?.mobileNumber
                        }
                      </div>
                    </div>
                  </div>

                  <div className="d-flex text-start align-items-center gap-3 mb-3">
                    <div>
                      <i className="bi bi-telephone-fill fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <div className="small">Telephone No.</div>
                      <div className="text-secondary small">
                        {application?.jobSeekerId?.personalInformation
                          ?.telephoneNumber || "not included"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header">
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "interviewSchedule" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("interviewSchedule")}
                  >
                    <i className="bi bi-calendar2-event-fill"></i> Interview
                    Schedule
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "hireDecline" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("hireDecline")}
                  >
                    <i className="bi bi-question-square-fill"></i> Hire |
                    Decline
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === "interviewSchedule" && (
                <InterviewSchedule
                  interviewDetails={
                    application?.interviewId ? application?.interviewId : null
                  }
                  getApplication={getApplication}
                />
              )}

              {activeTab === "hireDecline" && (
                <Hire_Decline
                  remarks={application?.remarks}
                  getApplication={getApplication}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationDetail;
