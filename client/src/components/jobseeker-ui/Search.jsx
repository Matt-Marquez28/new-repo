import React, { useState, useEffect } from "react";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import default_company from "../../images/default-company.jpg";

const Search = () => {
  // Load state from localStorage or use initial state
  const [jobTitle, setJobTitle] = useState(() => {
    const savedJobTitle = localStorage.getItem("jobTitle");
    return savedJobTitle || "";
  });

  const [employmentType, setEmploymentType] = useState(() => {
    const savedEmploymentType = localStorage.getItem("employmentType");
    return savedEmploymentType || "all";
  });

  const [salaryType, setSalaryType] = useState(() => {
    const savedSalaryType = localStorage.getItem("salaryType");
    return savedSalaryType || "all";
  });

  const [salaryMin, setSalaryMin] = useState(() => {
    const savedSalaryMin = localStorage.getItem("salaryMin");
    return savedSalaryMin ? Number(savedSalaryMin) : 0;
  });

  const [salaryMax, setSalaryMax] = useState(() => {
    const savedSalaryMax = localStorage.getItem("salaryMax");
    return savedSalaryMax ? Number(savedSalaryMax) : 100000;
  });

  const [jobVacancies, setJobVacancies] = useState(() => {
    const savedJobVacancies = localStorage.getItem("jobVacancies");
    return savedJobVacancies ? JSON.parse(savedJobVacancies) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jobTitle", jobTitle);
  }, [jobTitle]);

  useEffect(() => {
    localStorage.setItem("employmentType", employmentType);
  }, [employmentType]);

  useEffect(() => {
    localStorage.setItem("salaryType", salaryType);
  }, [salaryType]);

  useEffect(() => {
    localStorage.setItem("salaryMin", salaryMin);
  }, [salaryMin]);

  useEffect(() => {
    localStorage.setItem("salaryMax", salaryMax);
  }, [salaryMax]);

  useEffect(() => {
    localStorage.setItem("jobVacancies", JSON.stringify(jobVacancies));
  }, [jobVacancies]);

  // Function to get the badge class based on the employment type
  const getEmploymentTypeBadgeClass = (employmentType) => {
    switch (employmentType) {
      case "permanent":
        return "bg-info";
      case "part-time":
        return "bg-warning";
      case "contractual":
        return "bg-success";
      case "temporary":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  // Handle search input change
  const handleInputChange = (e) => {
    setJobTitle(e.target.value);
  };

  // Handle filter changes
  const handleEmploymentTypeChange = (e) => {
    setEmploymentType(e.target.value);
  };

  const handleSalaryTypeChange = (e) => {
    setSalaryType(e.target.value);
  };

  const handleSalaryMinChange = (e) => {
    setSalaryMin(e.target.value);
  };

  const handleSalaryMaxChange = (e) => {
    setSalaryMax(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (
      !jobTitle.trim() &&
      employmentType === "all" &&
      salaryType === "all" &&
      !salaryMin &&
      !salaryMax
    )
      return;

    setLoading(true); // Show loading spinner
    setError(""); // Reset error

    try {
      const params = {
        jobTitle,
        employmentType: employmentType !== "all" ? employmentType : undefined,
        salaryType: salaryType !== "all" ? salaryType : undefined,
        salaryMin: salaryMin || undefined,
        salaryMax: salaryMax || undefined,
      };

      console.log(params);

      // Simulate delay for fetching
      setTimeout(async () => {
        try {
          const res = await axios.get(`${JOB_VACANCY_API_END_POINT}/search`, {
            params,
          });

          console.log(res?.data);
          setJobVacancies(res?.data);
        } catch (error) {
          setError("Something went wrong. Please try again.");
        } finally {
          setLoading(false); // Hide loading spinner after data is fetched
        }
      }, 1500); // Delay set to 1500ms (1.5 seconds)
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false); // Hide loading spinner if an error occurs
    }
  };

  const truncateDescription = (description = "", maxLength = 400) => {
    if (!description || description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSearch}>
        <div className="d-flex justify-content-center">
          <div className="input-group mb-3" style={{ width: "100%" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for job vacancies by job title ( e.g., Software Engineer, Graphic Designer )"
              onChange={handleInputChange}
              value={jobTitle}
              aria-label="Example text with two button addons"
              style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            />
            <button className="btn btn-primary text-light" type="submit">
              <i className="bi bi-search"></i>{" "}
              <span className="d-none d-sm-inline"> Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filters UI */}
      <div className="mb-4 text-start">
        <div className="row">
          {/* Employment Type - col-6 for small screens, col-md-3 for medium+ */}
          <div className="col-6 col-md-3 mb-3 mb-md-0">
            <select
              id="employmentType"
              className="form-select"
              value={employmentType}
              onChange={handleEmploymentTypeChange}
            >
              <option value="all">Employment Type</option>
              <option value="permanent">Permanent</option>
              <option value="part-time">Part-time</option>
              <option value="temporary">Temporary</option>
              <option value="contractual">Contractual</option>
            </select>
          </div>

          {/* Salary Type - col-6 for small screens, col-md-3 for medium+ */}
          <div className="col-6 col-md-3 mb-3 mb-md-0">
            <select
              id="salaryType"
              className="form-select"
              value={salaryType}
              onChange={handleSalaryTypeChange}
            >
              <option value="all">Salary Type</option>
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Salary Min - col-6 for small screens, col-md-3 for medium+ */}
          <div className="col-6 col-md-3 mb-3 mb-md-0">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="salaryMin" className="mb-0">
                Min Salary
              </label>
              <span className="text-primary">
                P {Number(salaryMin).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              id="salaryMin"
              className="form-range"
              min="0"
              max="100000"
              step="1000"
              value={salaryMin}
              onChange={handleSalaryMinChange}
            />
          </div>

          {/* Salary Max - col-6 for small screens, col-md-3 for medium+ */}
          <div className="col-6 col-md-3">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="salaryMax" className="mb-0">
                Max Salary
              </label>
              <span className="text-primary">
                P {Number(salaryMax).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              id="salaryMax"
              className="form-range"
              min="0"
              max="100000"
              step="1000"
              value={salaryMax}
              onChange={handleSalaryMaxChange}
            />
          </div>
        </div>
      </div>

      {/* Error handling */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading Spinner */}
      {loading && (
        <div>
          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Job Vacancies Display */}
      <div style={{ maxHeight: "500px", overflow: "auto" }}>
        {jobVacancies.length === 0 && !loading ? (
          <p className="text-center">No job vacancies found.</p>
        ) : (
          jobVacancies.map((jobVacancy, index) => (
            <div
              className="border rounded bg-light p-3 text-start mb-3 job-list shadow-sm"
              key={index}
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
                    src={
                      jobVacancy?.companyInfo?.companyInformation
                        ?.companyLogo || default_company
                    }
                    alt={`${jobVacancy?.companyName} LOGO`}
                  />
                  <div className="mx-2">
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {
                        jobVacancy?.companyInfo?.companyInformation
                          ?.businessName
                      }
                    </p>
                    <h5
                      className="m-0 p-0 fw-bold"
                      style={{ color: "#555555" }}
                    >
                      {jobVacancy.jobTitle}
                    </h5>
                    <p
                      className="m-0 p-0 text-primary fw-semibold salary-range"
                      style={{ fontSize: "0.85rem" }}
                    >
                      ₱ {Number(jobVacancy?.salaryMin).toLocaleString()} -{" "}
                      {Number(jobVacancy?.salaryMax).toLocaleString()}{" "}
                      {`[${jobVacancy?.salaryType}]`}
                    </p>
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {jobVacancy?.workLocation}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`d-none d-sm-inline-block badge ${getEmploymentTypeBadgeClass(
                      jobVacancy?.employmentType
                    )} text-bg-info text-light px-3 py-1`}
                  >
                    {jobVacancy?.employmentType}
                  </span>
                </div>
              </div>
              <div
                className="text-secondary mt-3 p-2 bg-white rounded border border-primry border-opacity-25"
                style={{ fontSize: "0.85rem" }}
              >
                {jobVacancy?.description ? (
                  <p className="m-0">{truncateDescription(jobVacancy.description)}</p>
                ) : (
                  <p className="text-muted text-center my-3">
                    <i className="bi bi-file-text me-2"></i>{" "}
                    {/* Bootstrap icon */}
                    No job description provided.
                  </p>
                )}
              </div>
              {/* Footer */}
              <div className="d-flex mt-3 gap-2 justify-content-between">
                <div>
                  <Link to={`/jobseeker/job-vacancy-details/${jobVacancy._id}`}>
                    <button type="button" className="btn btn-info text-light">
                      <i className="bi bi-info-circle d-none d-md-inline-block"></i>{" "}
                      Details
                    </button>
                  </Link>

                  <button
                    type="button"
                    className="btn btn-outline-light text-info d-none d-sm-inline-block"
                  >
                    {jobVacancy?.applicants.length || 0}{" "}
                    <i className="bi bi-people-fill"></i> Applicants
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-light text-info d-none d-sm-inline-block"
                  >
                    {jobVacancy?.vacancies || 1}{" "}
                    <i className="bi bi-clipboard-check-fill"></i> Vacancies
                  </button>
                </div>
                <div className="d-flex align-items-end">
                  <p
                    className="m-0 p-0 text-secondary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-clipboard-fill"></i>{" "}
                    {`Posted on ${format(
                      new Date(jobVacancy?.createdAt),
                      "MMMM dd, yyyy"
                    )}`}
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

export default Search;
