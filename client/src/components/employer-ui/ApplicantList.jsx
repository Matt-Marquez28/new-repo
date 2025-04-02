import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../../contexts/socket.context";
const ApplicantList = () => {
  // states
  const [applicants, setApplicants] = useState([]);
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // constants
  const navigate = useNavigate();
  const [socket] = useSocketContext();

  // Fetch applicants when filter changes
  useEffect(() => {
    getAllEmployerApplicants(); // Runs when `filter` changes
  }, [filter]);

  // Listen for real-time applications via socket
  useEffect(() => {
    if (socket) {
      socket.on("newApplication", ({ message }) => {
        getAllEmployerApplicants(); // Refresh applicants when new one arrives
      });

      return () => {
        socket.off("newApplication"); // Proper cleanup to avoid duplicate listeners
      };
    }
  }, [socket]); // Runs only when socket changes

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
        <i className="bi bi-info-circle-fill text-primary"></i> Details
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
          <i className="bi bi-search"></i>{" "}
          <span className="d-none d-sm-inline"> Search</span>
        </button>
      </div>

      {/* filters UI */}
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
              <option value="pending">Pending</option>
              <option value="interview scheduled">Interview Scheduled</option>
              <option value="hired">Hired</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <button className="btn btn-light d-none d-sm-inline">
          <i className="bi bi-calendar-event-fill"></i> Interview Scheduled{" "}
          <span
            className={`badge ${
              interviewScheduledCount > 0 ? "bg-primary" : "bg-primary"
            }`}
          >
            {interviewScheduledCount}
          </span>
        </button>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "400px", overflowX: "auto", overflowY: "auto" }}>
        <table
          className="table table-hover table-striped text-start mt-2"
          style={{
            tableLayout: "fixed",
            width: "100%",
            // maxWidth: "400px", // Ensures table doesn't get too compressed
          }}
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
                style={{ width: "25%", minWidth: "120px" }}
              >
                <i className="bi bi-people-fill d-none d-sm-inline"></i>{" "}
                Applicants
              </th>
              <th
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "25%", minWidth: "120px" }}
              >
                <i className="bi bi-suitcase-lg-fill d-none d-sm-inline"></i>{" "}
                Job Position
              </th>
              <th
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "15%", minWidth: "90px" }}
              >
                <i className="bi bi-calendar-event-fill d-none d-sm-inline"></i>{" "}
                Date
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "15%", minWidth: "90px" }}
              >
                <i className="bi bi-question-square-fill d-none d-sm-inline"></i>{" "}
                Status
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center "
                style={{ width: "15%", minWidth: "90px" }}
              >
                <i className="bi bi-hand-index-thumb-fill d-none d-sm-inline"></i>{" "}
                Handle
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => (
                <tr
                  key={applicant._id}
                  // onClick={() =>
                  //   navigate(`/employer/application-details/${applicant._id}`)
                  // }
                >
                  <td
                    scope="row"
                    className="small text-muted align-middle fw-semibold"
                    style={{ width: "30%", minWidth: "150px" }}
                  >
                    {applicant?.photo && (
                      <img
                        src={applicant?.photo}
                        alt={applicant?.photo || "Photo"}
                        className="me-2 border shadow-sm d-none d-sm-inline"
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
                    style={{ width: "25%", minWidth: "120px" }}
                  >
                    {applicant.jobVacancyTitle}
                  </td>
                  <td
                    className="small text-muted align-middle"
                    style={{ width: "15%", minWidth: "90px" }}
                  >
                    {applicant?.createdAt
                      ? new Date(applicant.updatedAt).toLocaleDateString(
                          "en-US"
                        )
                      : "N/A"}
                  </td>
                  <td
                    className="small text-muted align-middle text-center"
                    style={{ width: "15%", minWidth: "90px" }}
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
                    style={{ width: "15%", minWidth: "90px" }}
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
