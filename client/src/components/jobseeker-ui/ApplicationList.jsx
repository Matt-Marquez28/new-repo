import React, { useState, useEffect } from "react";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";

const ApplicationList = () => {
  const navigate = useNavigate();
  const triggerToast = useToast();
  const [applications, setApplications] = useState([]); // Store all applications
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  useEffect(() => {
    getAllApplications();
  }, []);

  const getAllApplications = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/get-all-applications`,
        {
          withCredentials: true,
        }
      );
      setApplications(res?.data?.applications);
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "hired":
        return "bg-primary";
      case "pending":
        return "bg-warning";
      case "interview scheduled":
        return "bg-info";
      case "interview completed":
        return "bg-info";
      case "declined":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const dropdownContent = (applicationId, jobVacancyId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(applicationId)}>
        <i className="bi bi-info-circle-fill text-info"></i> Details
      </Dropdown.Item>
      <Dropdown.Item
        as="button"
        onClick={() => deleteApplication(jobVacancyId)}
      >
        <i className="bi bi-trash-fill text-danger"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (applicationId) => {
    console.log("Viewing details of application:", applicationId);
    navigate(`/jobseeker/application-details/${applicationId}`);
  };

  const deleteApplication = async (jobVacancyId) => {
    try {
      const res = await axios.delete(
        `${APPLICATION_API_END_POINT}/delete-application/${jobVacancyId}`,
        {
          withCredentials: true,
        }
      );
      triggerToast(res?.data?.message, "success");
      getAllApplications();
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase()); // Convert search term to lowercase
  };

  // Filtering applications based on search and filter criteria
  const filteredApplications = applications.filter((application) => {
    const jobVacancy = application?.jobVacancyId || {};
    const company = jobVacancy?.companyId || {};

    // Match filter
    const matchesFilter = filter === "all" || application.status === filter;

    // Match search term
    const matchesSearch =
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm) ||
      company?.companyInformation?.businessName
        ?.toLowerCase()
        .includes(searchTerm) ||
      application?.status?.toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  // Calculate the number of applications with status "interview scheduled"
  const interviewScheduledCount = applications.filter(
    (application) => application.status === "interview scheduled"
  ).length;

  return (
    <div>
      {/* Search UI */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find your application"
          style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-primary text-light" type="submit">
          <i className="bi bi-search"></i> Search
        </button>
      </div>

      {/* Filters UI */}
      <div className="d-flex justify-content-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <h6 className="text-secondary fw-normal m-0">Sort by: </h6>
          <div>
            <select
              id="filter"
              className="form-select text-info"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="interview scheduled">Interview Scheduled</option>
              <option value="hired">Hired</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
        <button className="btn btn-light text-info">
          <i className="bi bi-calendar-event-fill"></i> Interview Scheduled{" "}
          <span
            className={`badge ${
              interviewScheduledCount > 0 ? "bg-danger" : "bg-secondary"
            }`}
          >
            {interviewScheduledCount}
          </span>
        </button>
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
                <i className="bi bi-suitcase-lg-fill"></i> Job Position
              </th>
              <th
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "20%" }}
              >
                <i className="bi bi-calendar-event-fill"></i> Date
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "15%" }}
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
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const jobVacancy = application?.jobVacancyId || {};
                const company = jobVacancy?.companyId || {};
                return (
                  <tr key={application._id}>
                    <td
                      className="small text-muted align-middle fw-semibold"
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
                      className="small text-muted align-middle"
                      style={{ width: "25%" }}
                    >
                      {jobVacancy?.jobTitle || "N/A"}
                    </td>
                    <td
                      className="small text-muted align-middle"
                      style={{ width: "20%" }}
                    >
                      {application?.createdAt
                        ? new Date(application.updatedAt).toLocaleDateString(
                            "en-US"
                          )
                        : "N/A"}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      <span
                        className={`badge ${getStatusBadgeClass(
                          application?.status
                        )}`}
                      >
                        {application?.status || "N/A"}
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
                        {dropdownContent(
                          application?._id,
                          application?.jobVacancyId?._id
                        )}
                      </Dropdown>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationList;