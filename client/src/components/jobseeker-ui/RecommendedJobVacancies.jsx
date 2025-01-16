import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { format } from "date-fns";
import { useUser } from "../../contexts/user.context";

const RecommendedJobVacancies = () => {
  const { user } = useUser();
  const [jobVacancies, setJobVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    getRecommendedJobVacancies();
  }, []);

  const getRecommendedJobVacancies = async () => {
    try {
      setLoading(true);
      const jobPreferences = user?.profileData?.jobPreferences || {};
      console.log("Job Preferences:", jobPreferences);
      const res = await axios.post(
        `${JOB_VACANCY_API_END_POINT}/get-recommended-job-vacancies`,
        jobPreferences
      );
      setJobVacancies(res?.data?.results || []);
      console.log(res?.data?.results);
    } catch (error) {
      console.error("Error:", error);
      setJobVacancies([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmploymentTypeBadgeClass = (employmentType) => {
    const badges = {
      permanent: "bg-info",
      "part-time": "bg-warning",
      contractual: "bg-success",
      temporary: "bg-secondary",
    };
    return badges[employmentType] || "bg-secondary";
  };

  const truncateDescription = (description = "", maxLength = 400) => {
    if (!description || description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  if (loading) {
    return (
      <div>
        {/* Loading Spinner */}
        {loading && (
          <div className="d-flex justify-content-center gap-3 my-3">
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h5 className="text-primary text-center">
        <i className="bi bi-hand-thumbs-up-fill"></i> Recommended Jobs{" "}
        {`[${jobVacancies?.length}]`}
      </h5>
      <p className="card-text text-center">
        Recommended jobs based on your profile.
      </p>
      <div className="d-flex justify-content-center"></div>

      <div ref={containerRef} style={{ maxHeight: "500px", overflow: "auto" }}>
        {!jobVacancies?.length ? (
          <p className="text-center">No job vacancies found.</p>
        ) : (
          jobVacancies.map((job, index) => (
            <div
              className="border rounded p-3 text-start mb-3 shadow-sm job-list"
              key={job?._id || index}
            >
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <img
                    className="border shadow-sm"
                    style={{
                      height: "90px",
                      width: "90px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                    src={job?.companyLogo || "/default-company-logo.png"}
                    alt="Company Logo"
                    onError={(e) => {
                      e.target.src = "/default-company-logo.png";
                    }}
                  />
                  <div className="mx-2">
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {job?.companyName}
                    </p>
                    <h5
                      className="m-0 p-0 fw-bold"
                      style={{ color: "#555555" }}
                    >
                      {job?.jobTitle}
                    </h5>
                    <p
                      className="m-0 p-0 text-primary fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      ₱ {Number(job?.salaryMin || 0).toLocaleString()} -{" "}
                      {Number(job?.salaryMax || 0).toLocaleString()}
                      {job?.salaryType === "monthly"
                        ? " [monthly]"
                        : " [hourly]"}
                    </p>
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {job?.workLocation}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`badge ${getEmploymentTypeBadgeClass(
                      job?.employmentType
                    )} text-light px-3 py-1`}
                  >
                    {job?.employmentType}
                  </span>
                </div>
              </div>

              <div
                className="text-secondary my-2"
                style={{ fontSize: "0.85rem" }}
              >
                <p>{truncateDescription(job?.description)}</p>
              </div>

              <div className="d-flex mt-3 gap-2 justify-content-between">
                <div>
                  <Link to={`/jobseeker/job-vacancy-details/${job?._id}`}>
                    <button type="button" className="btn btn-info text-light">
                      <i className="bi bi-info-circle"></i> Details
                    </button>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-light text-info"
                  >
                    {(job?.applicants || []).length}{" "}
                    <i className="bi bi-people-fill"></i> Applicants
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light text-info"
                  >
                    {job?.vacancies || 1}{" "}
                    <i className="bi bi-clipboard-check-fill"></i> Vacancies
                  </button>
                </div>
                <div className="d-flex align-items-end">
                  <p
                    className="m-0 p-0 text-secondary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-clipboard-fill"></i> Posted on{" "}
                    {format(
                      new Date(job?.createdAt || new Date()),
                      "MMMM dd, yyyy"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedJobVacancies;
