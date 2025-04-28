import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useNavigate } from "react-router-dom";
import ScheduleInterview from "../employer-ui/ScheduleInterview";
import Footer from "../shared-ui/Footer";
import axios from "axios";
import { useParams } from "react-router-dom";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import ApplicantResume from "../employer-ui/ApplicantResume";
import Hire_Decline from "../employer-ui/Hire_Decline";
import default_profile from "../../images/default-profile.jpg";

const ApplicationDetails = () => {
  const [application, setApplication] = useState(null);
  const { applicationId } = useParams();
  const navigate = useNavigate();

  // current state
  const [activeTab, setActiveTab] = useState("resume");

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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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
      case "declined":
        progressProps = {
          variant: "danger",
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="">
          <div className="d-flex align-items-center">
            <button onClick={() => navigate(-1)} className="btn btn-light me-2">
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
              <i className="bi bi-file-earmark-text-fill text-white"></i>
            </div>
            <h5 className="my-2" style={{ color: "#1a4798" }}>
              Application for {application?.jobVacancyId?.jobTitle}
            </h5>
          </div>
        </div>
      </div>

      <div>
        {/* Hiring Progress Section - Always Visible */}
        <div className="p-3 border rounded bg-light mb-3">
          <h5 className="mb-3 text-center" style={{ color: "#1a4798" }}>
            Hiring Progress
          </h5>
          {getStatusProgressBar(application?.status)}
          <span
            className="text-center mt-1"
            style={{ fontSize: "0.85rem", display: "block", color: "#1a4798" }}
          >
            {application?.status}
          </span>
        </div>

        <div className="">
          <div className="card shadow-sm">
            <div className="card-header">
              <ul className="nav nav-pills card-header-pills">
                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "resume" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("resume")}
                  >
                    <i className="bi bi-file-person-fill"></i> Resume
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link btn ${
                      activeTab === "scheduleInterview" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("scheduleInterview")}
                  >
                    <i className="bi bi-calendar2-event-fill"></i> Schedule
                    Interview
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
              {activeTab === "scheduleInterview" && (
                <ScheduleInterview
                  interviewDetails={
                    application?.interviewId ? application?.interviewId : null
                  }
                  setApplication={setApplication}
                  getApplication={getApplication}
                />
              )}
              {activeTab === "resume" && (
                <ApplicantResume jobseekerData={application?.jobSeekerId} />
              )}
              {activeTab === "hireDecline" && (
                <Hire_Decline getApplication={getApplication} />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationDetails;
