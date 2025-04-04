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
                  <div className="my-2">
                    <h4
                      className=" text-center fw-bold"
                      style={{ color: "#555555" }}
                    >
                      {jobVacancy?.jobTitle}
                    </h4>
                    {/* short details */}
                    <div className="my-4">
                      <div className="row gap-2 justify-content-center">
                        {/* First Row */}
                        <div className="col-12 col-md-5 d-flex justify-content-center">
                          {/* Applicants Button */}
                          <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 p-2 w-100 fs-6">
                            <i className="bi bi-people-fill fs-6"></i>
                            <span>
                              {jobVacancy?.applicants.length || 0} Applicants
                            </span>
                          </button>
                        </div>

                        <div className="col-12 col-md-5 d-flex justify-content-center">
                          {/* Vacancies Button */}
                          <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 p-2 w-100 fs-6">
                            <i className="bi bi-clipboard-check-fill fs-6"></i>
                            <span>{jobVacancy?.vacancies || 1} Vacancies</span>
                          </button>
                        </div>

                        {/* Second Row */}
                        <div className="col-12 col-md-5 d-flex justify-content-center">
                          {/* Salary Range Button */}
                          <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 p-2 w-100 fs-6">
                            <span>
                              {`₱ ${jobVacancy?.salaryMin.toLocaleString()} - ${jobVacancy?.salaryMax.toLocaleString()} ${
                                jobVacancy?.salaryType === "monthly"
                                  ? "[mo]"
                                  : "[hr]"
                              }`}
                            </span>
                          </button>
                        </div>

                        <div className="col-12 col-md-5 d-flex justify-content-center">
                          {/* Employment Type Button */}
                          <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 p-2 w-100 fs-6">
                            <i className="bi bi-briefcase-fill fs-6"></i>
                            <span>{jobVacancy?.employmentType}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="text-secondary small m-0">
                        <i className="bi bi-clipboard-fill"></i> Posted on{" "}
                        {formatDate(jobVacancy?.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="small m-0 text-secondary">
                        <i className="bi bi-clipboard2-x-fill"></i> Deadline on{" "}
                        {formatDate(jobVacancy?.applicationDeadline)}
                      </p>
                    </div>
                    {/* Other component code */}
                  </div>

                  <hr />

                  <div className="mb-4">
                    <h5 class="card-title m-0 text-primary">Job Description</h5>
                    <p class="card-text text-secondary small">
                      {`${jobVacancy?.description}`}
                    </p>
                  </div>

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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
            <div class="card shadow-sm">
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
                </div>

                <hr />

                <div className="mb-3">
                  <h5 class="card-title m-0 text-primary">Industry</h5>
                  <p class="card-text text-secondary small">
                    {jobVacancy?.companyId?.companyInformation?.industry}
                  </p>
                </div>

                <div className="mb-3">
                  <h5 class="card-title m-0 text-primary">Company Size</h5>
                  <p class="card-text text-secondary small">
                    {jobVacancy?.companyId?.companyInformation?.companySize}
                  </p>
                </div>

                <div className="mb-3">
                  <h5 class="card-title m-0 text-primary">Office Type</h5>
                  <p class="card-text text-secondary small">
                    {jobVacancy?.companyId?.companyInformation?.officeType}
                  </p>
                </div>

                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-light btn-sm text-secondary"
                    onClick={() =>
                      navigate(
                        `/jobseeker/company-information/${jobVacancy?.companyId?._id}`
                      )
                    }
                  >
                    Company Details
                  </button>
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
