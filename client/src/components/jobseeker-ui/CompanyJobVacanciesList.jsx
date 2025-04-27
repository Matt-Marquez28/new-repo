import React, { useEffect, useState, useRef } from "react";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import default_company from "../../images/default-company.jpg";
import { format } from "date-fns";

const CompanyJobVacanciesList = ({ companyId, companyName }) => {
  const [jobVacancies, setJobVacancies] = useState([]);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    getCompanyJobVacancies();
  }, []);

  const getCompanyJobVacancies = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-employer-job-vacancies-by-company-id/${companyId}`
      );
      setJobVacancies(res?.data?.jobVacancies || []);
      console.log(res?.data?.jobVacancies);
    } catch (error) {
      console.log(error);
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

  return (
    <div>
      <div className="my-3">
        <h5
          className=" text-center fw-semibold mb-1"
          style={{ color: "#1a4798" }}
        >
          Current Job Openings at {companyName}{" "}
          <span className="badge rounded text-white" style={{ backgroundColor: "#1a4798" }}>
            {jobVacancies?.length}
          </span>
        </h5>
        <p className="text-muted text-center m-0">
          Explore career opportunities with this employer.
        </p>
      </div>
      <div className="d-flex justify-content-center"></div>

      <div ref={containerRef} style={{ maxHeight: "565px", overflow: "auto" }}>
        {!jobVacancies?.length ? (
          <div className="text-center p-4 border rounded-3  bg-light">
            <i className="bi bi-suitcase-lg fs-1 text-muted mb-3"></i>
            <p className="text-muted">
              No job vacancies found.
              <br /> Please check back later.
            </p>
          </div>
        ) : (
          jobVacancies.map((job, index) => (
            <div
              className="border rounded p-3 text-start mb-3 shadow-sm job-list bg-light"
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
                    src={job?.companyId.companyInformation?.companyLogo || default_company}
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
                      className="m-0 p-0 text-primary fw-semibold salary-range"
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
                    className={`d-none d-sm-inline-block badge ${getEmploymentTypeBadgeClass(
                      job?.employmentType
                    )} text-light px-3 py-1`}
                  >
                    {job?.employmentType}
                  </span>
                </div>
              </div>

              <div
                className="text-secondary mt-3 p-2 bg-white rounded border border-primry border-opacity-25"
                style={{ fontSize: "0.85rem" }}
              >
                {job?.description ? (
                  <p className="m-0">{truncateDescription(job.description)}</p>
                ) : (
                  <p className="text-muted text-center my-3">
                    <i className="bi bi-file-text me-2"></i>{" "}
                    {/* Bootstrap icon */}
                    No job description provided.
                  </p>
                )}
              </div>

              <div className="d-flex mt-3 gap-2 justify-content-between">
                <div>
                  <Link to={`/jobseeker/job-vacancy-details/${job?._id}`}>
                    <button type="button" className="btn btn-info text-light">
                      <i className="bi bi-info-circle d-none d-md-inline-block"></i>{" "}
                      Details
                    </button>
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline-light text-info d-none d-sm-inline-block"
                  >
                    {(job?.applicants || []).length}{" "}
                    <i className="bi bi-people-fill"></i> Applicants
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light text-info d-none d-sm-inline-block"
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

export default CompanyJobVacanciesList;
