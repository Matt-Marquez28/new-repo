import React, { useState, useEffect } from "react";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { Dropdown, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const JobSeekerVerification = () => {
  const [status, setStatus] = useState("all"); // State to store the selected status
  const [documents, setDocuments] = useState([]); // State to store the fetched documents
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllJobSeekerDocuments();
  }, [filter]); // Re-fetch documents when the status changes

  const getAllJobSeekerDocuments = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-all-jobseeker-documents`,
        {
          params: { status: filter }, // Add the query parameter for status
        }
      );
      console.log(res?.data?.documents);
      setDocuments(res?.data?.documents); // Update documents state
      setStats(res?.data?.stats);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Function to get the badge class based on the status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "verified":
        return "bg-success text-white";
      case "declined":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  // Dropdown content for action buttons
  const dropdownContent = (documentId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(documentId)}>
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (documentId) => {
    navigate(`jobseeker-verification-details/${documentId}`);
  };

  return (
    <div className="container">
      <section class="mb-3">
        <div class="row justify-content-center">
          <div>
            <div class="row gy-4">
              <div class="col-12 col-lg-3">
                <div class="card widget-card border-light shadow-sm">
                  <div class="card-body p-4">
                    <div class="row">
                      <div class="col-8">
                        <h5 class="card-title widget-card-title mb-3">
                          All Documents
                        </h5>
                        <h4 class="card-subtitle text-body-secondary m-0">
                          {stats?.all}
                        </h4>
                      </div>
                      <div class="col-4">
                        <div class="d-flex justify-content-end">
                          <div class="lh-1 text-white bg-primary rounded-circle p-3 d-flex align-items-center justify-content-center">
                            <i class="bi bi-file-earmark-text fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="card widget-card border-light shadow-sm">
                  <div class="card-body p-4">
                    <div class="row">
                      <div class="col-8">
                        <h5 class="card-title widget-card-title mb-3">
                          Pending
                        </h5>
                        <h4 class="card-subtitle text-body-secondary m-0">
                          {stats?.pending}
                        </h4>
                      </div>
                      <div class="col-4">
                        <div class="d-flex justify-content-end">
                          <div class="lh-1 text-white bg-warning rounded-circle p-3 d-flex align-items-center justify-content-center">
                            <i className="bi bi-hourglass fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="card widget-card border-light shadow-sm">
                  <div class="card-body p-4">
                    <div class="row">
                      <div class="col-8">
                        <h5 class="card-title widget-card-title mb-3">
                          Verified
                        </h5>
                        <h4 class="card-subtitle text-body-secondary m-0">
                          {stats?.verified}
                        </h4>
                      </div>
                      <div class="col-4">
                        <div class="d-flex justify-content-end">
                          <div class="lh-1 text-white bg-success rounded-circle p-3 d-flex align-items-center justify-content-center">
                            <i className="bi bi-file-earmark-check fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-3">
                <div class="card widget-card border-light shadow-sm">
                  <div class="card-body p-4">
                    <div class="row">
                      <div class="col-8">
                        <h5 class="card-title widget-card-title mb-3">
                          Declined
                        </h5>
                        <h4 class="card-subtitle text-body-secondary m-0">
                          {stats?.declined}
                        </h4>
                      </div>
                      <div class="col-4">
                        <div class="d-flex justify-content-end">
                          <div class="lh-1 text-white bg-danger rounded-circle p-3 d-flex align-items-center justify-content-center">
                            <i className="bi bi-file-earmark-x fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters UI & Search UI */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <h6 className="text-secondary fw-normal m-0">Sort by: </h6>
          <div>
            <select
              id="filter"
              className="form-select text-secondary"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <div className="input-group" style={{ width: "350px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Find document of job seeker"
            />
            <button className="btn btn-light text-secondary" type="submit">
              <i className="bi bi-search"></i> Search
            </button>
          </div>
        </div>
      </div>

      {/* List UI */}
      <table className="table table-hover mt-2">
        <thead>
          <tr>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-people-fill"></i> Name
            </th>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-calendar-event-fill"></i> Date
            </th>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-question-square-fill"></i> Status
            </th>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-envelope-fill"></i> Email
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
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <tr key={doc.id}>
                <td scope="row" className="small text-muted align-middle">
                  {`${doc?.jobSeekerId?.personalInformation?.firstName} ${doc?.jobSeekerId?.personalInformation?.lastName}`}
                </td>
                <td className="small text-muted align-middle">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="small text-muted align-middle">
                  <span
                    className={`text-white badge ${getStatusBadgeClass(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="small text-muted align-middle">
                  {doc?.jobSeekerId?.personalInformation?.emailAddress}
                </td>
                <td className="small text-muted align-middle text-center">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="light"
                      className="text-secondary btn-sm"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </Dropdown.Toggle>
                    {dropdownContent(doc._id)}
                  </Dropdown>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JobSeekerVerification;
