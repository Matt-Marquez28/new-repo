import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useSocketContext } from "../../contexts/socket.context";
import default_company from "../../images/default-company.jpg";

const JobInvitationList = () => {
  const navigate = useNavigate();
  const triggerToast = useToast();
  const [invitations, setInvitations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [socket] = useSocketContext();

  useEffect(() => {
    getAllEmployerJobInvitations();
  }, []);

  const getAllEmployerJobInvitations = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-jobseeker-job-invitations`,
        {
          withCredentials: true,
        }
      );
      setInvitations(res?.data?.invitations || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newInvitation", ({ message }) => {
        getAllEmployerJobInvitations();
      });

      return () => {
        socket.off("newInvitation");
      };
    }
  }, [socket]);

  // Dropdown content for action buttons
  const dropdownContent = (jobVacancyId, invitationId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(jobVacancyId)}>
        <i className="bi bi-info-circle-fill text-primary"></i> Details
      </Dropdown.Item>
      <Dropdown.Item as="button" onClick={() => deleteInvitation(invitationId)}>
        <i className="bi bi-trash-fill text-danger"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  // View job vacancy details
  const viewDetails = (jobVacancyId) => {
    navigate(`/jobseeker/job-vacancy-details/${jobVacancyId}`);
  };

  // Delete job invitation
  const deleteInvitation = async (invitationId) => {
    try {
      const res = await axios.delete(
        `${JOB_VACANCY_API_END_POINT}/delete-job-invitation/${invitationId}`
      );
      triggerToast(res?.data?.message, "success");
      getAllEmployerJobInvitations();
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase()); // Convert search term to lowercase
  };

  // Filter invitations based on search term
  const filteredInvitations = invitations.filter((invitation) => {
    const company = invitation?.companyId?.companyInformation || {};
    const jobVacancy = invitation?.jobVacancyId || {};

    const matchesSearch =
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm) ||
      company?.businessName?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div>
      {/* Search UI */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find your job invitations by ( job title or company name )"
          style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button
          className="btn text-light"
          type="submit"
          style={{ backgroundColor: "#1a4798" }}
        >
          <i className="bi bi-search"></i>{" "}
          <span className="d-none d-sm-inline"> Search</span>
        </button>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "400px", overflowX: "auto", overflowY: "auto" }}>
        <table
          className="table table-hover table-striped"
          style={{ tableLayout: "fixed", minWidth: "500px" }}
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
                <i className="bi bi-building-fill d-none d-sm-inline"></i>{" "}
                Company
              </th>
              <th
                scope="col"
                className="small text-muted align-middle"
                style={{ width: "25%" }}
              >
                <i className="bi bi-suitcase-lg-fill d-none d-sm-inline"></i>{" "}
                Job Position
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "25%" }}
              >
                <i className="bi bi-calendar-event-fill d-none d-sm-inline"></i>{" "}
                Date
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "25%" }}
              >
                <i className="bi bi-hand-index-thumb-fill d-none d-sm-inline"></i>{" "}
                Handle
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredInvitations.length > 0 ? (
              filteredInvitations.map((invitation) => (
                <tr key={invitation._id}>
                  <td
                    scope="row"
                    className="small text-muted align-middle"
                    style={{ width: "25%" }}
                  >
                    {invitation?.companyId?.companyInformation?.companyLogo && (
                      <img
                        src={
                          invitation?.companyId?.companyInformation
                            .companyLogo || default_company
                        }
                        alt={
                          invitation?.companyId?.companyInformation
                            .businessName || "Company Logo"
                        }
                        className="me-2 border shadow-sm d-none d-sm-inline"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                    {invitation?.companyId?.companyInformation?.businessName ||
                      "N/A"}
                  </td>
                  <td
                    scope="row"
                    className="small text-muted align-middle"
                    style={{ width: "25%" }}
                  >
                    {invitation?.jobVacancyId?.jobTitle || "N/A"}
                  </td>
                  <td
                    className="small text-muted align-middle text-center"
                    style={{ width: "25%" }}
                  >
                    {invitation?.createdAt
                      ? new Date(invitation.createdAt).toLocaleDateString(
                          "en-US"
                        )
                      : "N/A"}
                  </td>
                  <td
                    scope="row"
                    className="small text-muted align-middle text-center"
                    style={{ width: "25%" }}
                  >
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="light"
                        className="text-secondary btn-sm"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </Dropdown.Toggle>
                      {dropdownContent(
                        invitation?.jobVacancyId?._id,
                        invitation?._id
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No invitations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobInvitationList;
