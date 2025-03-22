import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const JobVacancyVerification = () => {
  const [status, setStatus] = useState("all"); // State to store the selected status
  const [jobVacancies, setJobVacancies] = useState([]);
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const navigate = useNavigate();

  useEffect(() => {
    getAllJobVacancies();
  }, [filter]);

  const getAllJobVacancies = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-job-vacancies-admin`,
        {
          params: { status: filter }, // Add the query parameter for status
        }
      );
      console.log(res?.data?.stats);
      setJobVacancies(res?.data?.jobVacancies);
      setStats(res?.data?.stats);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "approved":
        return "bg-success text-white";
      case "declined":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const dropdownContent = (jobVacancyId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(jobVacancyId)}>
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (jobVacancyId) => {
    navigate(`job-vacancy-verification-details/${jobVacancyId}`);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase()); // Convert search term to lowercase
  };

  // Filter job vacancies based on search term
  const filteredJobVacancies = jobVacancies.filter((jobVacancy) => {
    const company = jobVacancy?.companyId?.companyInformation || {};
    const matchesSearch =
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm) ||
      company?.businessName?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  const statsData = [
    {
      title: "All Job Vacancies",
      value: stats?.all || 0,
      icon: "bi bi-briefcase-fill",
      bgColor: "bg-primary",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: "bi bi-hourglass",
      bgColor: "bg-warning",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      icon: "bi bi-file-earmark-check",
      bgColor: "bg-success",
    },
    {
      title: "Declined",
      value: stats?.declined || 0,
      icon: "bi bi-file-earmark-x",
      bgColor: "bg-danger",
    },
  ];

  return (
    <div className="container">
      <h4 className="text-primary mb-3 mx-1">
        <i className="bi bi-clipboard-check-fill"></i> Job Vacancy Verification
      </h4>
      <section className="mb-3">
        <div className="row justify-content-center">
          <div>
            <div className="row">
              {statsData.map((stat, index) => (
                <div key={index} className="col" style={{ minWidth: "200px" }}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center">
                        <div className={`${stat.bgColor} rounded-3 p-2 me-3`}>
                          <i className={`${stat.icon} text-white fs-5`}></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1 small text-uppercase">
                            {stat.title}
                          </h6>
                          <h5 className="card-title mb-0 fw-bold">
                            {stat.value.toLocaleString()}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search UI */}
      <div className="d-flex justify-content-center mb-3">
        <div className="input-group" style={{ width: "100%" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Find job vacancy by ( job title or company name )"
            style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="btn btn-primary text-light" type="submit">
            <i className="bi bi-search"></i> Search
          </button>
        </div>
      </div>

      {/* Filters UI */}
      <div className="d-flex justify-content-start mb-2">
        <div className="d-flex align-items-center gap-2">
          <div>
            <select
              id="filter"
              className="form-select"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container with Scrollable Body */}
      <div style={{ maxHeight: "380px", overflowY: "auto" }}>
        <table className="table table-hover table-striped mt-2">
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <tr>
              <th scope="col" className="small text-muted align-middle">
                <i className="bi bi-briefcase-fill"></i> Job Title
              </th>
              <th scope="col" className="small text-muted align-middle">
                <i className="bi bi-building-fill"></i> Company
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
              >
                <i className="bi bi-calendar-event-fill"></i> Date Posted
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
              >
                <i className="bi bi-search"></i> Vacancies
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
              >
                <i className="bi bi-question-square-fill"></i> Publication
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
              >
                <i className="bi bi-hand-index-thumb-fill"></i> Handle
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJobVacancies.length > 0 ? (
              filteredJobVacancies.map((jobVacancy, index) => (
                <tr key={jobVacancy?._id}>
                  <td scope="row" className="small align-middle text-muted fw-semibold">
                    {jobVacancy?.jobTitle}
                  </td>
                  <td className="small text-muted align-middle">
                    {jobVacancy.companyId?.companyInformation?.businessName}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    {new Date(jobVacancy.createdAt).toLocaleDateString()}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    {jobVacancy?.vacancies}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    <span
                      className={`text-white badge ${getStatusBadgeClass(
                        jobVacancy.publicationStatus
                      )}`}
                    >
                      {jobVacancy.publicationStatus}
                    </span>
                  </td>
                  <td className="small text-muted align-middle text-center">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        className="text-secondary btn-sm"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </Dropdown.Toggle>
                      {dropdownContent(jobVacancy._id)}
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobVacancyVerification;