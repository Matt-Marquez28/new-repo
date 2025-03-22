import React, { useState, useEffect } from "react";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";

const SavedJobs = () => {
  const triggerToast = useToast();
  const [savedJobVacancies, setSavedJobVacancies] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllSavedJobVacancies();
  }, []);

  const getAllSavedJobVacancies = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-saved-job-vacancies`,
        {
          withCredentials: true,
        }
      );
      setSavedJobVacancies(res?.data?.savedJobVacancies || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ongoing":
        return "bg-warning";
      case "expired":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const dropdownContent = (jobVacancyId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(jobVacancyId)}>
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
      <Dropdown.Item as="button" onClick={() => deleteSavedJob(jobVacancyId)}>
        <i className="bi bi-trash"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (jobVacancyId) => {
    navigate(`/jobseeker/job-vacancy-details/${jobVacancyId}`);
  };

  const deleteSavedJob = async (jobVacancyId) => {
    console.log(jobVacancyId);
    try {
      const res = await axios.delete(
        `${JOB_VACANCY_API_END_POINT}/delete-saved-job-vacancy/${jobVacancyId}`,
        {
          withCredentials: true,
        }
      );
      triggerToast(res?.data?.message, "success");
      getAllSavedJobVacancies();
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredSavedJobs = savedJobVacancies.filter((jobVacancy) => {
    const company = jobVacancy?.companyId || {};
    const matchesFilter = filter === "all" || jobVacancy.status === filter;

    const matchesSearch =
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm) ||
      company?.companyInformation?.businessName
        ?.toLowerCase()
        .includes(searchTerm) ||
      jobVacancy?.status?.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Search UI */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find your saved jobs by ( job position or title )"
          style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-primary text-light" type="submit">
          <i className="bi bi-search"></i> Search
        </button>
      </div>

      {/* Filters UI */}
      <div className="d-flex justify-content-start gap-3">
        <div className="d-flex align-items-center gap-2">
          <div>
            <select
              id="filter"
              className="form-select"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="ongoing">On-going</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table
          className="table table-hover mt-2"
          style={{ tableLayout: "fixed", width: "100%" }}
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
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "25%" }}
              >
                <i className="bi bi-building-fill"></i> Company
              </th>
              <th
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "25%" }}
              >
                <i className="bi bi-briefcase-fill"></i> Job Title
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "15%" }}
              >
                <i className="bi bi-calendar-event-fill"></i> Date Posted
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "20%" }}
              >
                <i className="bi bi-question-square-fill"></i> Status
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "15%" }}
              >
                <i className="bi bi-hand-index-thumb-fill"></i> Handle
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredSavedJobs.length > 0 ? (
              filteredSavedJobs.map((jobVacancy) => {
                const company = jobVacancy?.companyId || {};
                return (
                  <tr key={jobVacancy._id}>
                    <td
                      className="small text-muted align-middle"
                      style={{ width: "25%" }}
                    >
                      {company?.companyInformation?.companyLogo && (
                        <img
                          src={company?.companyInformation.companyLogo}
                          alt={
                            company.companyInformation.businessName ||
                            "Company Logo"
                          }
                          className="me-2 border shadow-sm"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      )}
                      {company?.companyInformation?.businessName || "N/A"}
                    </td>
                    <td
                      scope="row"
                      className="small align-middle text-muted"
                      style={{ width: "25%" }}
                    >
                      {jobVacancy?.jobTitle || "N/A"}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "20%" }}
                    >
                      {jobVacancy?.createdAt
                        ? new Date(jobVacancy.createdAt).toLocaleDateString(
                            "en-US"
                          )
                        : "N/A"}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "20%" }}
                    >
                      <span
                        className={`text-white badge ${getStatusBadgeClass(
                          jobVacancy?.status
                        )}`}
                      >
                        {jobVacancy?.status || "N/A"}
                      </span>
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          className="text-secondary btn-sm"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        {dropdownContent(jobVacancy?._id)}
                      </Dropdown>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No saved jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavedJobs;
