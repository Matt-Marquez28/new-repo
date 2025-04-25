import React, { useState, useEffect } from "react";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const JobVacancyList = () => {
  const navigate = useNavigate();
  const [jobVacancies, setJobVacancies] = useState([]);
  const [filteredJobVacancies, setFilteredJobVacancies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllEmployerJobVacancies();
  }, []);

  useEffect(() => {
    applyFilterAndSearch();
  }, [filter, searchTerm, jobVacancies]);

  const getAllEmployerJobVacancies = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-employer-job-vacancies`,
        {
          withCredentials: true,
        }
      );
      setJobVacancies(res?.data?.jobVacancies || []);
    } catch (error) {
      console.log(error);
    }
  };

  const applyFilterAndSearch = () => {
    let vacancies = [...jobVacancies];

    // Apply filter
    if (filter !== "all") {
      vacancies = vacancies.filter((job) => job.publicationStatus === filter);
    }

    // Apply search
    if (searchTerm) {
      vacancies = vacancies.filter((job) =>
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobVacancies(vacancies);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "declined":
        return "bg-danger";
      case "approved":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const dropdownContent = (jobVacancyId) => (
    <Dropdown.Menu>
      <Dropdown.Item
        as="button"
        onClick={() =>
          navigate(`/employer/job-vacancy-details/${jobVacancyId}`)
        }
      >
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  return (
    <div>
      {/* Filters UI & Search UI */}
      <div className="d-flex justify-content-between flex-wrap gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div>
            <select
              id="filter"
              className="form-select text-secondary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <div className="input-group" style={{ minWidth: "250px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search job vacancies"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            />
            <button
              className="btn text-light"
              type="button"
              style={{ backgroundColor: "#1a4798" }}
            >
              <i className="bi bi-search"></i>{" "}
              <span className="d-none d-sm-inline"> Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table UI */}
      <div className="table-responsive" style={{ maxHeight: "450px" }}>
        <table
          className="table table-hover table-striped"
          style={{ minWidth: "900px" }} // Set minimum width for the table
        >
          {/* Table Header */}
          <thead
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <tr>
              <th
                className="small text-muted align-middle"
                style={{ width: "200px" }}
              >
                <i className="bi bi-suitcase-lg-fill"></i> Job Title
              </th>
              <th
                className="small text-muted align-middle"
                style={{ width: "150px" }}
              >
                <i className="bi bi-calendar-event-fill"></i> Date
              </th>
              <th
                className="small text-muted align-middle"
                style={{ width: "150px" }}
              >
                <i className="bi bi-calendar-event-fill"></i> Deadline
              </th>
              <th
                className="small text-muted align-middle text-center"
                style={{ width: "100px" }}
              >
                <i className="bi bi-search"></i> Vacancies
              </th>
              <th
                className="small text-muted align-middle text-center"
                style={{ width: "100px" }}
              >
                <i className="bi bi-people-fill"></i> Applicants
              </th>
              <th
                className="small text-muted align-middle text-center"
                style={{ width: "150px" }}
              >
                <i className="bi bi-question-square-fill"></i> Publication
              </th>
              <th
                className="small text-muted align-middle text-center"
                style={{ width: "150px" }}
              >
                <i className="bi bi-hand-index-thumb-fill"></i> Handle
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredJobVacancies.length > 0 ? (
              filteredJobVacancies.map((jobVacancy) => (
                <tr key={jobVacancy._id}>
                  <td className="small text-muted align-middle">
                    {jobVacancy.jobTitle}
                  </td>
                  <td className="small text-muted align-middle">
                    {new Date(jobVacancy?.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="small text-muted align-middle">
                    {new Date(
                      jobVacancy?.applicationDeadline
                    ).toLocaleDateString()}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    {jobVacancy?.vacancies}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    {jobVacancy?.applicants.length}
                  </td>
                  <td className="small text-muted align-middle text-center">
                    <span
                      className={`badge ${getStatusBadgeClass(
                        jobVacancy?.publicationStatus
                      )}`}
                    >
                      {jobVacancy?.publicationStatus}
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
                <td colSpan="7" className="text-center">
                  No job vacancies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobVacancyList;
