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
        {/* Reported Users Tab */}
        <Tab eventKey="reported" title="Reported Users">
          {loadingReports ? (
            <Spinner animation="border" className="d-block mx-auto mt-3" />
          ) : reportedAccounts.length > 0 ? (
            <div className="container">
              {reportedAccounts.map((report) => (
                <div key={report._id} className="card shadow-sm p-3 mb-4 w-100">
                  {/* Reported User Info */}
                  <div className="d-flex justify-content-between align-items-start">
                    {/* User Details */}
                    <div>
                      <h5 className="fw-bold">
                        {`${report.accountId?.firstName} ${report.accountId?.lastName}` ||
                          "N/A"}
                      </h5>
                      <p className="text-muted mb-1">
                        {report.accountId?.emailAddress || "N/A"}
                      </p>
                      <span className="badge bg-info">
                        {report.accountId?.role || "N/A"}
                      </span>
                    </div>

                    {/* Right Section: Report Count + Buttons */}
                    <div className="d-flex flex-column align-items-end">
                      {/* Reports Count */}
                      <span className="text-danger fs-6 fw-bold mb-2">
                        {report.reports.length} Reports
                      </span>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleBlockUser(report.accountId?._id)}
                        >
                          {report.accountId?.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDeleteUser(report.accountId?._id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Reports List */}
                  <h6 className="fw-semibold">Reports:</h6>
                  <ul className="list-group">
                    {report.reports.map((r, i) => (
                      <li key={i} className="list-group-item">
                        <b>{r.reason}</b> - Reported by{" "}
                        {r.reportedBy?.firstName} on{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center mt-3">No reported users</p>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default RegularUsers;
