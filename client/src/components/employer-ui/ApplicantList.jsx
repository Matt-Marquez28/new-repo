import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ApplicantList = () => {
  // states
  const [applicants, setApplicants] = useState([]);
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // constants
  const navigate = useNavigate();

  // useEffect to run the getEmployerApplicants function
  useEffect(() => {
    getAllEmployerApplicants();
  }, [filter]);

  // function to get all employer applicants
  const getAllEmployerApplicants = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/get-all-employer-applicants`,
        {
          params: { status: filter }, // Send the filter as a query parameter
          withCredentials: true,
        }
      );
      console.log(res?.data?.applicants); // Check applicants structure
      setApplicants(res?.data?.applicants || []);
    } catch (error) {
      console.log("Error fetching applicants:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase()); // Convert search term to lowercase
  };

  // Function to get the badge class based on the status
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

  // Dropdown content for action buttons
  const dropdownContent = (applicationId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(applicationId)}>
        <i className="bi bi-info-circle-fill text-info"></i> Details
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (applicationId) => {
    console.log("Viewing details of application:", applicationId);
    navigate(`/employer/application-details/${applicationId}`);
  };

  // Calculate the number of applications with status "interview scheduled"
  const interviewScheduledCount = applicants.filter(
    (applicant) => applicant.status === "interview scheduled"
  ).length;

  // Filter applicants based on search term
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant?.jobSeekerFirstName?.toLowerCase().includes(searchTerm) ||
      applicant?.jobSeekerLastName?.toLowerCase().includes(searchTerm) ||
      applicant?.jobVacancyTitle?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div>
      {/* search UI */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find your applicants by ( name or job title )"
          style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-primary text-light" type="submit">
          <i className="bi bi-search"></i> Search
        </button>
      </div>

      {/* filters UI */}
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
          className="table table-hover text-start mt-2"
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
                style={{ width: "30%" }}
              >
                <i className="bi bi-people-fill"></i> Applicants [
                {filteredApplicants?.length}]
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
                style={{ width: "15%" }}
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
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <tr key={applicant._id}>
                  <td
                    scope="row"
                    className="small text-muted align-middle fw-semibold"
                    style={{ width: "30%" }}
                  >
                    {applicant?.photo && (
                      <img
                        src={applicant?.photo}
                        alt={applicant?.photo || "Photo"}
                        className="me-2 border shadow-sm"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                    {`${applicant.jobSeekerFirstName} ${applicant.jobSeekerLastName}`}
                  </td>
                  <td
                    className="small text-muted align-middle"
                    style={{ width: "25%" }}
                  >
                    {applicant.jobVacancyTitle}
                  </td>
                  <td
                    className="small text-muted align-middle"
                    style={{ width: "15%" }}
                  >
                    {applicant?.createdAt
                      ? new Date(applicant.updatedAt).toLocaleDateString(
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
                        applicant?.status
                      )}`}
                    >
                      {applicant?.status || "N/A"}
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
                      {dropdownContent(applicant._id)}
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No applicants available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantList;