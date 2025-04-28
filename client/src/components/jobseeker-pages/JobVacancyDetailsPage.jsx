import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { format } from "date-fns";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";
import Footer from "../shared-ui/Footer";
import { useUser } from "../../contexts/user.context";
import ReportButton from "../shared-ui/ReportButton";
import default_company from "../../images/default-company.jpg";

const JobVacancyDetailsPage = ({ currentUser }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const triggerToast = useToast();
  const { jobVacancyId } = useParams();
  const [jobVacancy, setJobVacancy] = useState(null);
  const [loading, setLoading] = useState(false);

  const primaryColor = "#1a4798";
  const secondaryColor = "#f8f9fa";

  // useEffect to automatically scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getSingleJobVacancy();
  }, []);

  const getSingleJobVacancy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-single-job-vacancy/${jobVacancyId}`
      );
      setJobVacancy(res?.data?.jobVacancy);
      console.log(res?.data?.jobVacancy);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const applyJobVacancy = async () => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/apply-job-vacancy/${jobVacancyId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log(res?.data?.message);
      triggerToast(res?.data?.message, "primary");
      getSingleJobVacancy();
    } catch (error) {
      console.log(error?.response?.data?.message);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const saveJobVacancy = async () => {
    try {
      const res = await axios.post(
        `${JOB_VACANCY_API_END_POINT}/save-job-vacancy/${jobVacancyId}`,
        {},
        { withCredentials: true }
      );

      // Update the user state
      setUser((prev) => {
        const updatedUser = {
          ...prev, // Spread the previous user object
          profileData: {
            ...prev.profileData, // Spread the previous profile data
            savedJobVacancies: [
              ...prev.profileData.savedJobVacancies,
              jobVacancyId,
            ], // Add the jobVacancyId
          },
        };

        // Store the updated user in localStorage
        localStorage.setItem("@user", JSON.stringify(updatedUser));

        return updatedUser;
      });

      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const deleteSavedJobVacancy = async () => {
    try {
      const res = await axios.delete(
        `${JOB_VACANCY_API_END_POINT}/delete-saved-job-vacancy/${jobVacancyId}`,
        { withCredentials: true }
      );

      // Update the user state
      setUser((prev) => {
        const updatedUser = {
          ...prev, // Spread the previous user object
          profileData: {
            ...prev.profileData, // Spread the previous profile data
            savedJobVacancies: prev.profileData.savedJobVacancies.filter(
              (id) => id !== jobVacancyId // Remove the jobVacancyId
            ),
          },
        };

        // Store the updated user in localStorage
        localStorage.setItem("@user", JSON.stringify(updatedUser));

        return updatedUser;
      });

      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      console.log(error?.response?.data?.message);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  // Check if the current user has already applied
  const isAlreadyApplied = jobVacancy?.applicants?.some(
    (applicant) => applicant.userId === currentUser?.id
  );

  // check if the current user has already saved the job vacancy
  const isJobVacancySaved =
    user?.profileData?.savedJobVacancies.includes(jobVacancyId);

  const formatDate = (date) => {
    if (!date) return "N/A"; // Return "N/A" if date is not available
    try {
      return format(new Date(date), "MMMM dd yyyy");
    } catch (error) {
      console.error("Invalid date:", date);
      return "Invalid date";
    }
  };

  const truncateDescription = (description = "", maxLength = 400) => {
    if (!description || description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  const InfoItem = ({ label, value, icon }) => (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div className="bg-white p-2 rounded border">
        <i className={`bi bi-${icon} fs-5`} style={{ color: "#1a4798" }}></i>
      </div>
      <div>
        <div className="fw-semibold small text-muted">{label}</div>
        <div className="small">{value || "-"}</div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="d-flex my-2 justify-content-between">
        <div>
          <button
            type="button"
            className="btn btn-light text-dark"
            onClick={() => navigate(-1)}
          >
            <i class="bi bi-arrow-left"></i>
          </button>
        </div>
        <div className="d-flex gap-2">
          <ReportButton accountId={jobVacancy?.accountId} />
          <button
            type="button"
            className="btn btn-primary text-light"
            onClick={applyJobVacancy}
            disabled={
              isAlreadyApplied ||
              new Date(jobVacancy?.applicationDeadline) < new Date()
            } // Disable if already applied or past deadline
          >
            <i className="bi bi-file-earmark-check d-none d-sm-inline-block"></i>{" "}
            {new Date(jobVacancy?.applicationDeadline) < new Date()
              ? "Expired"
              : isAlreadyApplied
              ? "Applied"
              : "Apply"}
          </button>

          <button
            type="button"
            className="btn btn-warning text-white"
            onClick={isJobVacancySaved ? deleteSavedJobVacancy : saveJobVacancy}
          >
            <i
              className={`bi ${
                isJobVacancySaved ? "bi-bookmark-fill" : "bi-bookmark"
              } d-none d-sm-inline-block`}
            ></i>{" "}
            {isJobVacancySaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center gap-3 my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Job Vacancy Details */}
          {jobVacancy && (
            <div className="col-md-8">
              <div className="card shadow-sm mb-4">
                <div
                  className="card-header text-white text-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <h6 className="m-0 fw-normal">Job Vacancy Details</h6>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-md-6">
                      {/* Job Information */}
                      <div className="card p-3 mb-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-suitcase-lg-fill"></i>
                          Job Information
                        </h5>
                        <InfoItem
                          label="Job Title"
                          value={jobVacancy.jobTitle}
                          icon="briefcase-fill"
                        />
                        <InfoItem
                          label="Employment Type"
                          value={jobVacancy.employmentType}
                          icon="person-workspace"
                        />
                        <InfoItem
                          label="Work Location"
                          value={jobVacancy.workLocation}
                          icon="geo-alt-fill"
                        />
                        <InfoItem
                          label="Vacancies"
                          value={jobVacancy.vacancies}
                          icon="people-fill"
                        />
                        <InfoItem
                          label="Industry"
                          value={jobVacancy.industry}
                          icon="building-fill"
                        />
                      </div>

                      {/* Salary Information */}
                      <div className="card p-3 mb-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-wallet-fill"></i>
                          Salary Information
                        </h5>
                        <InfoItem
                          label="Salary Type"
                          value={jobVacancy.salaryType}
                          icon="cash-stack"
                        />
                        <InfoItem
                          label="Minimum Salary"
                          value={`$${jobVacancy.salaryMin?.toLocaleString()}`}
                          icon="currency-dollar"
                        />
                        <InfoItem
                          label="Maximum Salary"
                          value={`$${jobVacancy.salaryMax?.toLocaleString()}`}
                          icon="currency-exchange"
                        />
                      </div>

                      {/* Additional Information */}
                      <div className="card p-3">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-info-circle-fill"></i>
                          Additional Information
                        </h5>
                        <InfoItem
                          label="Application Deadline"
                          value={formatDate(jobVacancy.applicationDeadline)}
                          icon="calendar-fill"
                        />
                        <InfoItem
                          label="Interview Process"
                          value={jobVacancy.interviewProcess}
                          icon="list-check"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-md-6">
                      {/* Job Description */}
                      <div className="card mb-4 p-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-file-text-fill"></i>
                          Job Description
                        </h5>
                        <p className="mb-0 text-secondary small">
                          {jobVacancy.description || "No description provided."}
                        </p>
                      </div>

                      {/* Required Qualifications */}
                      <div className="card mb-4 p-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-list-check"></i>
                          Required Qualifications
                        </h5>
                        <ul className="list-unstyled">
                          {jobVacancy.requiredQualifications?.map(
                            (qualification, index) => (
                              <li key={index} className="mb-2">
                                <div className="d-flex align-items-start">
                                  <i
                                    className="bi bi-check-circle-fill mt-1 me-2"
                                    style={{ color: primaryColor }}
                                  ></i>
                                  <span className="small">{qualification}</span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Responsibilities */}
                      <div className="card mb-4 p-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-card-checklist"></i>
                          Responsibilities
                        </h5>
                        <ul className="list-unstyled">
                          {jobVacancy.responsibilities?.map(
                            (responsibility, index) => (
                              <li key={index} className="mb-2">
                                <div className="d-flex align-items-start">
                                  <i
                                    className="bi bi-check-circle-fill mt-1 me-2"
                                    style={{ color: primaryColor }}
                                  ></i>
                                  <span className="small">
                                    {responsibility}
                                  </span>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      {/* Skills Required */}
                      <div className="card p-4">
                        <h5
                          className="d-flex align-items-center gap-2 mb-3"
                          style={{ color: primaryColor }}
                        >
                          <i className="bi bi-tools"></i>
                          Skills Required
                        </h5>
                        <div className="d-flex flex-wrap gap-2">
                          {jobVacancy.skillsRequired?.map((skill, index) => (
                            <span
                              key={index}
                              className="badge"
                              style={{
                                backgroundColor: "rgba(26, 71, 152, 0.1)",
                                color: primaryColor,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About the Company Section */}
          {/* About the Company Section */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div
                className="card-header text-white text-center"
                style={{ backgroundColor: "#1a4798" }}
              >
                <div className="d-flex align-items-center justify-content-center">
                  <h6 className="m-0 fw-normal">About the Company</h6>
                </div>
              </div>

              <div className="card-body p-4">
                {/* Company Profile */}
                <div className="card mb-4 text-center p-3">
                  <div className="mb-3">
                    <img
                      src={
                        jobVacancy?.companyId?.companyInformation
                          ?.companyLogo || default_company
                      }
                      alt="Company Logo"
                      className="border rounded shadow-sm"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <h5 className="m-0" style={{ color: "#1a4798" }}>
                    {jobVacancy?.companyId?.companyInformation?.businessName}
                  </h5>
                  {jobVacancy?.companyId?.companyInformation?.industry && (
                    <div className="text-center mt-2">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "rgba(26, 71, 152, 0.1)",
                          color: "#1a4798",
                          display: "inline-block",
                          borderRadius: "0.25rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        {jobVacancy?.companyId?.companyInformation?.industry}
                      </span>
                    </div>
                  )}
                </div>

                {/* Company Description */}
                <div className="card p-3 mb-4">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: "#1a4798" }}
                  >
                    <i className="bi bi-info-circle-fill"></i>
                    Company Description
                  </h5>
                  <p className="text-secondary small">
                    {jobVacancy?.companyId?.companyInformation?.description ||
                      "No description provided."}
                  </p>
                  <div className="text-center mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        navigate(
                          `/jobseeker/company-information/${jobVacancy?.companyId?._id}`
                        )
                      }
                    >
                      <i className="bi bi-info-circle me-1"></i> View Full
                      Company Profile
                    </button>
                  </div>
                </div>

                {/* Company Details */}
                <div className="card p-3">
                  <h5
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{ color: "#1a4798" }}
                  >
                    <i className="bi bi-building-fill"></i>
                    Company Details
                  </h5>

                  <InfoItem
                    label="Company Size"
                    value={
                      jobVacancy?.companyId?.companyInformation?.companySize ||
                      "Not specified"
                    }
                    icon="people-fill"
                  />

                  <InfoItem
                    label="Office Type"
                    value={
                      jobVacancy?.companyId?.companyInformation?.officeType ||
                      "Not specified"
                    }
                    icon="house-door-fill"
                  />

                  <InfoItem
                    label="Type of Business"
                    value={
                      jobVacancy?.companyId?.companyInformation
                        ?.typeOfBusiness || "Not specified"
                    }
                    icon="briefcase-fill"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobVacancyDetailsPage;
