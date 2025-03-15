import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";

const JobInvitationList = () => {
  const triggerToast = useToast();
  const [invitations, setInvitations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  useEffect(() => {
    getAllEmployerJobInvitations();
  }, []);

  const getAllEmployerJobInvitations = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-employer-job-invitations`,
        {
          withCredentials: true,
        }
      );
      setInvitations(res?.data?.invitations || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Dropdown content for action buttons
  const dropdownContent = (invitationId) => (
    <Dropdown.Menu>
      {/* Uncomment below for viewing details
      <Dropdown.Item as="button" onClick={() => viewDetails(jobVacancyId)}>
        <i className="bi bi-info-circle-fill text-info"></i> Details
      </Dropdown.Item> */}
      <Dropdown.Item as="button" onClick={() => deleteInvitation(invitationId)}>
        <i className="bi bi-trash-fill text-danger"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  // Delete job invitation
  const deleteInvitation = async (invitationId) => {
    console.log("Delete invitation:", invitationId);
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
    const jobSeeker = invitation?.jobSeekerId?.personalInformation || {};
    const jobVacancy = invitation?.jobVacancyId || {};

    const matchesSearch =
      jobSeeker?.firstName?.toLowerCase().includes(searchTerm) ||
      jobSeeker?.lastName?.toLowerCase().includes(searchTerm) ||
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  return (
    <div>
      {/* Search UI */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Find your application by  job seeker name or job title"
          style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-primary text-light" type="submit">
          <i className="bi bi-search"></i> Search
        </button>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table
          className="table table-hover table-striped"
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
                <i className="bi bi-people-fill"></i> Job Seeker
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
                style={{ width: "25%" }}
              >
                <i className="bi bi-calendar-event-fill"></i> Date
              </th>
              <th
                scope="col"
                className="small text-muted align-middle text-center"
                style={{ width: "25%" }}
              >
                <i className="bi bi-hand-index-thumb-fill"></i> Handle
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
                    className="small text-muted align-middle fw-semibold"
                    style={{ width: "25%" }}
                  >
                    {invitation?.jobSeekerId?.personalInformation?.photo && (
                      <img
                        src={
                          invitation?.jobSeekerId?.personalInformation?.photo
                        }
                        alt={
                          invitation?.jobSeekerId?.personalInformation
                            ?.firstName +
                            " " +
                            invitation?.jobSeekerId?.personalInformation
                              ?.lastName || "Company Logo"
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
                    {invitation?.jobSeekerId?.personalInformation?.firstName}{" "}
                    {invitation?.jobSeekerId?.personalInformation?.lastName}
                  </td>
                  <td
                    className="small text-muted align-middle"
                    style={{ width: "25%" }}
                  >
                    {invitation?.jobVacancyId?.jobTitle || "N/A"}
                  </td>
                  <td
                    className="small text-muted align-middle"
                    style={{ width: "25%" }}
                  >
                    {invitation?.createdAt
                      ? new Date(invitation.createdAt).toLocaleDateString(
                          "en-US"
                        )
                      : "N/A"}
                  </td>
                  <td
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
                      {dropdownContent(invitation?._id)}
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