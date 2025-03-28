import React, { useState, useEffect } from "react";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import {
  Tabs,
  Tab,
  Table,
  Dropdown,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";

const RegularUsers = () => {
  const triggerToast = useToast();
  const [users, setUsers] = useState([]);
  const [reportedAccounts, setReportedAccounts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [filter]); // Fetch users when filter changes

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${ACCOUNT_API_END_POINT}/get-all-users`, {
        params: {
          role: filter !== "all" ? filter : undefined,
          search: searchTerm || undefined,
        },
        withCredentials: true,
      });
      setUsers(res?.data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReportedUsers = async () => {
    setLoadingReports(true);
    try {
      const res = await axios.get(
        `${ACCOUNT_API_END_POINT}/get-reported-accounts`,
        {
          withCredentials: true,
        }
      );
      setReportedAccounts(res?.data?.reportedAccounts || []);
    } catch (error) {
      console.error("Error fetching reported users:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleBlockUser = async (accountId) => {
    try {
      const res = await axios.put(
        `${ACCOUNT_API_END_POINT}/toggle-block-user/${accountId}`,
        {},
        { withCredentials: true }
      );
      fetchUsers();
      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleDeleteUser = async (accountId) => {
    try {
      await axios.delete(`${ACCOUNT_API_END_POINT}/delete-user/${accountId}`, {
        withCredentials: true,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container">
      <Tabs
        defaultActiveKey="users"
        id="user-tabs"
        className="mb-3"
        onSelect={(key) => {
          if (key === "reported") fetchReportedUsers();
        }}
      >
        {/* Regular Users Tab */}
        <Tab eventKey="users" title="Regular Users">
          {/* Filter & Search Bar */}
          <div className="d-flex justify-content-between mb-3">
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="all">All Users</option>
              <option value="jobseeker">Job Seekers</option>
              <option value="employer">Employers</option>
            </Form.Select>

            <div className="input-group" style={{ width: "350px" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" onClick={fetchUsers}>
                Search
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <Spinner animation="border" className="d-block mx-auto mt-3" />
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.firstName}</td>
                      <td>{user.emailAddress}</td>
                      <td>{user.role}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.isBlocked ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" className="btn-sm">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleBlockUser(user._id)}
                            >
                              {user.isBlocked ? "Unblock User" : "Block User"}
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete User
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users available
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Reported Users Tab */}
        <Tab eventKey="reported" title="Reported Users">
          {loadingReports ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : reportedAccounts.length > 0 ? (
            <div className="container-fluid px-0">
              {reportedAccounts.map((report) => (
                <div
                  key={report._id}
                  className="card border-0 bg-light shadow-sm mb-4"
                >
                  {/* Card Header */}
                  <div className="card-header bg-light border-bottom-0 pb-0 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <span className="badge rounded-pill bg-danger">
                          {report.reports.length}{" "}
                          {report.reports.length === 1 ? "Report" : "Reports"}
                        </span>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">
                          {`${report.accountId?.firstName || ""} ${
                            report.accountId?.lastName || ""
                          }`.trim() || "Unknown User"}
                        </h5>
                        <small className="text-muted">
                          {report.accountId?.emailAddress || "No email"}
                        </small>
                      </div>
                    </div>
                    <span className="badge bg-white text-dark">
                      {report.accountId?.role || "Unknown role"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body pt-3 bg-light">
                    {/* Reports Accordion */}
                    <div className="accordion" id={`accordion-${report._id}`}>
                      {report.reports.map((r, i) => (
                        <div key={i} className="accordion-item border-0 mb-2">
                          <h2
                            className="accordion-header"
                            id={`heading-${report._id}-${i}`}
                          >
                            <button
                              className="accordion-button collapsed bg-white py-2"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse-${report._id}-${i}`}
                              aria-expanded="false"
                              aria-controls={`collapse-${report._id}-${i}`}
                            >
                              <div className="d-flex flex-column">
                                <span className="fw-medium">{r.reason}</span>
                                <small className="text-muted">
                                  Reported by{" "}
                                  {r.reportedBy?.firstName || "Anonymous"} •{" "}
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                            </button>
                          </h2>
                          <div
                            id={`collapse-${report._id}-${i}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading-${report._id}-${i}`}
                            data-bs-parent={`#accordion-${report._id}`}
                          >
                            <div className="accordion-body bg-white pt-2">
                              <p className="mb-0 text-muted small">
                                {r.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-2 border-top pt-3">
                      <button
                        className={`btn btn-sm ${
                          report.accountId?.isBlocked
                            ? "btn-success"
                            : "btn-warning"
                        }`}
                        onClick={() => handleBlockUser(report.accountId?._id)}
                      >
                        <i
                          className={`bi ${
                            report.accountId?.isBlocked
                              ? "bi-unlock"
                              : "bi-lock"
                          }`}
                        ></i>
                        {report.accountId?.isBlocked
                          ? " Unblock User"
                          : " Block User"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(report.accountId?._id)}
                      >
                        <i className="bi bi-trash"></i> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-light rounded p-4">
              <i className="bi bi-people display-5 text-muted mb-3"></i>
              <h5 className="text-muted">No reported users found</h5>
              <p className="text-muted small">
                When users get reported, they'll appear here
              </p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default RegularUsers;
