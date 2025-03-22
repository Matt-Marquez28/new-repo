import React, { useState, useEffect } from "react";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";
import { useToast } from "../../contexts/toast.context";

const RegularUsers = () => {
  const triggerToast = useToast();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [filter]); // Fetch users when filter changes

  const getAllUsers = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleBlockUser = async (accountId) => {
    try {
      const res = await axios.put(
        `${ACCOUNT_API_END_POINT}/toggle-block-user/${accountId}`,
        {},
        { withCredentials: true }
      );
      getAllUsers();
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
      getAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container">
      {/* Filters & Search UI */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="jobseeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
        </div>
        <div className="d-flex align-items-center">
          <div className="input-group" style={{ width: "350px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={getAllUsers}
            >
              <i className="bi bi-search"></i> Search
            </button>
          </div>
        </div>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "550px", overflowY: "auto" }}>
        {loading ? (
          <p className="text-center mt-3">Loading users...</p>
        ) : (
          <table className="table table-hover table-striped mt-2">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th className="small text-muted align-middle">Name</th>
                <th className="small text-muted align-middle">Email</th>
                <th className="small text-muted align-middle">Role</th>
                <th className="small text-muted align-middle">isBlocked</th>
                <th className="small text-muted align-middle text-center">
                  Handle
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className="small text-muted align-middle fw-semibold">
                      {user.firstName}
                    </td>
                    <td className="small text-muted align-middle">
                      {user.emailAddress}
                    </td>
                    <td className="small text-muted align-middle">
                      {user.role}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.isBlocked ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="text-center">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          className="text-secondary btn-sm"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            as="button"
                            onClick={() => handleBlockUser(user._id)}
                          >
                            {user.isBlocked ? "Unblock User" : "Block User"}
                          </Dropdown.Item>
                          <Dropdown.Item
                            as="button"
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
          </table>
        )}
      </div>
    </div>
  );
};

export default RegularUsers;
