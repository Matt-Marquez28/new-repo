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

    return <ProgressBar {...progressProps} />;
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
            <i className="bi bi-arrow-90deg-left"></i>
          </button>
          <h5 className="my-2 text-primary">
            Application for {application?.jobVacancyId?.jobTitle}
          </h5>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-primary text-center fw-normal text-light">
              <i className="bi bi-info-circle"></i> Overview
            </div>
            <div className="card-body">
              <div className="text-center">
                {/* Photo Section - Hidden on medium screens */}
                <div className="d-none d-md-block">
                  <img
                    src={
                      application?.jobSeekerId?.personalInformation?.photo ||
                      "https://th.bing.com/th/id/OIP.OesLvyzDO6AvU_hYUAT4IAHaHa?rs=1&pid=ImgDetMain"
                    }
                    className="rounded border shadow-sm"
                    alt="Avatar"
                    style={{ width: "100px", height: "100px" }}
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
                <div className="p-3 border rounded">
                  <h5 className="mb-3 text-primary">Hiring Progress</h5>
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
                <div className="p-3 border rounded">
                  <h5 className="mb-3 text-primary">Contact</h5>
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
