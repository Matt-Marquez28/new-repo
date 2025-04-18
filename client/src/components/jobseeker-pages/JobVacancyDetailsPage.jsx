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
            className="btn btn-outline-primary"
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
          <div className="col-md-8">
            <div>
              <div class="card shadow-sm mb-3">
                <Link className="card-header bg-primary text-decoration-none text-center fw-normal text-light">
                  Job Details
                </Link>
                <div class="card-body">
                  <div className="my-3">
                    <h4 className="text-center fw-bold text-dark mb-2">
                      {" "}
                      {/* Reduced margin-bottom */}
                      {jobVacancy?.jobTitle}
                    </h4>

                    {/* Compact Card Grid */}
                    <div className="row g-2 justify-content-center my-3">
                      {" "}
                      {/* Reduced gap to g-2 */}
                      {/* Applicants */}
                      <div className="col-6 col-md-3">
                        <div className="d-flex align-items-center bg-white p-2 rounded border h-100 ">
                          {" "}
                          {/* Reduced padding to p-2 */}
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center "
                            style={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                            }}
                          >
                            <i className="bi bi-people-fill text-primary fs-6"></i>
                          </div>
                          <div className="ms-2 ">
                            <div className="text-muted small">Applicants</div>
                            <div className="fw-semibold text-primary">
                              {jobVacancy?.applicants.length || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Vacancies */}
                      <div className="col-6 col-md-3">
                        <div className="d-flex align-items-center bg-white p-2 rounded border h-100">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                            }}
                          >
                            <i className="bi bi-clipboard-check-fill text-primary fs-6"></i>
                          </div>
                          <div className="ms-2">
                            <div className="text-muted small">Vacancies</div>
                            <div className="fw-semibold text-primary">
                              {jobVacancy?.vacancies || 1}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Salary */}
                      <div className="col-6 col-md-3">
                        <div className="d-flex align-items-center bg-white p-2 rounded border h-100">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                            }}
                          >
                            <i className="bi bi-cash-stack text-primary fs-6"></i>
                          </div>
                          <div className="ms-2" style={{ minWidth: 0 }}>
                            <div className="text-muted small">Salary</div>
                            <div
                              className="fw-semibold text-truncate text-primary"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {" "}
                              {/* Custom smaller size */}₱
                              {jobVacancy?.salaryMin?.toLocaleString()}-
                              {jobVacancy?.salaryMax?.toLocaleString()}
                              <span
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {" "}
                                {/* Even smaller for unit */}
                                {jobVacancy?.salaryType === "monthly"
                                  ? "/mo"
                                  : "/hr"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Employment Type */}
                      <div className="col-6 col-md-3">
                        <div className="d-flex align-items-center bg-white p-2 rounded border h-100">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                            }}
                          >
                            <i className="bi bi-suitcase-lg-fill text-primary fs-6"></i>
                          </div>
                          <div className="ms-2">
                            <div className="text-muted small">Type</div>
                            <div className="fw-semibold text-capitalize text-primary">
                              {jobVacancy?.employmentType}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Date Info */}
                    <div className="d-flex flex-wrap justify-content-between gap-1 small mt-2">
                      {" "}
                      {/* Reduced gap to g-1 */}
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-calendar-check me-1 text-primary"></i>
                        <span>Posted: {formatDate(jobVacancy?.createdAt)}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-calendar-x me-1 text-danger"></i>
                        <span>
                          Closes: {formatDate(jobVacancy?.applicationDeadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 border border-primary border-opacity-25 p-3 rounded bg-light">
                    <h5 class="card-title m-0 text-primary">Job Description</h5>
                    <p class="card-text text-secondary small">
                      {`${jobVacancy?.description}`}
                    </p>
                  </div>

                  <div className="mb-3  border border-primary border-opacity-25 p-3 rounded bg-light">
                    <h5 className="m-0 text-primary">
                      Required Qualifications
                    </h5>
                    {jobVacancy?.requiredQualifications?.length > 0 ? (
                      <ul className="list-unstyled">
                        {jobVacancy.requiredQualifications.map(
                          (qualification, index) => (
                            <li key={index} className="text-secondary small">
                              • {qualification}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-secondary">
                        No qualifications listed.
                      </p>
                    )}
                  </div>

                  <div className="mb-3  border border-primary border-opacity-25 p-3 rounded bg-light">
                    <h5 className="card-title m-0 text-primary">
                      Skills Required
                    </h5>
                    {jobVacancy?.skillsRequired?.length > 0 ? (
                      <ul className="list-unstyled">
                        {jobVacancy.skillsRequired.map((skill, index) => (
                          <li key={index} className="text-secondary small">
                            • {skill}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-secondary">No skills listed.</p>
                    )}
                  </div>

                  <div className="mb-3  border border-primary border-opacity-25 p-3 rounded bg-light">
                    <h5 className="card-title m-0 text-primary">
                      Responsibilities
                    </h5>
                    {jobVacancy?.responsibilities?.length > 0 ? (
                      <ul className="list-unstyled">
                        {jobVacancy.responsibilities.map(
                          (responsibility, index) => (
                            <li key={index} className="text-secondary small">
                              • {responsibility}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-secondary">No skills listed.</p>
                    )}
                  </div>

                  <div className="mb-2  border border-primary border-opacity-25 p-3 rounded bg-light">
                    <h5 class="card-title m-0 text-primary">Work Location</h5>
                    <p className="text-secondary small">
                      {jobVacancy?.workLocation ||
                        "Work location not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About the Company Section */}
          <div className="col-md-4">
            <div class="card shadow-sm about-company-card">
              <Link class="card-header bg-primary text-decoration-none text-center fw-normal text-light">
                About the company
              </Link>
              <div class="card-body">
                <div className="">
                  <div className="d-flex justify-content-center mb-2">
                    <img
                      src={
                        jobVacancy?.companyId?.companyInformation
                          ?.companyLogo || default_company
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
                  </div>

                  <h4
                    class="card-title text-center fw-bold mb-3"
                    style={{ color: "#555555" }}
                  >
                    {jobVacancy?.companyId?.companyInformation?.businessName}
                  </h4>
                  <div className="bg-light p-3 rounded border border-primary border-opacity-25">
                    <p class="card-text text-justify text-secondary small m-0">
                      {truncateDescription(
                        jobVacancy?.companyId?.companyInformation?.description
                      )}
                    </p>
                  </div>
                  <div className="d-flex justify-content-center my-3">
                    <button
                      className="btn btn-outline-light btn-sm text-secondary"
                      onClick={() =>
                        navigate(
                          `/jobseeker/company-information/${jobVacancy?.companyId?._id}`
                        )
                      }
                    >
                      <i className="bi bi-info-circle"></i> Company Details
                    </button>
                  </div>
                </div>

                <hr />

                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <i className="bi bi-building-fill fs-6"></i>
                      </div>
                      <div className="ms-3">
                        <div className="text-muted small text-uppercase">
                          Industry
                        </div>
                        <div className="fw-medium text-primary">
                          {jobVacancy?.companyId?.companyInformation
                            ?.industry || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <i className="bi bi-people-fill fs-6"></i>
                      </div>
                      <div className="ms-3">
                        <div className="text-muted small text-uppercase">
                          Company Size
                        </div>
                        <div className="fw-medium text-capitalize text-primary">
                          {jobVacancy?.companyId?.companyInformation
                            ?.companySize || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <i className="bi bi-suitcase-lg-fill fs-6"></i>
                      </div>
                      <div className="ms-3">
                        <div className="text-muted small text-uppercase">
                          Office Type
                        </div>
                        <div className="fw-medium text-capitalize text-primary">
                          {jobVacancy?.companyId?.companyInformation
                            ?.officeType || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
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
