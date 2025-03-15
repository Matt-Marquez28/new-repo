import React, { useState, useEffect } from "react";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { Dropdown } from "react-bootstrap";

const RegularUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    applyFilterAndSearch();
  }, [filter, searchTerm, users]);

  const handleBlockUser = async (accountId) => {
    try {
      const res = await axios.put(
        `${ACCOUNT_API_END_POINT}/toggle-block-user/${accountId}`,
        {}, // Empty body (if needed)
        { withCredentials: true } // Moved to options object
      );
      getAllUsers();
      console.log("User blocked successfully:", res.data);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleDeleteUser = async (accountId) => {
    try {
      const res = await axios.delete(
        `${ACCOUNT_API_END_POINT}/delete-user/${accountId}`,
        {
          withCredentials: true,
        }
      );
      getAllUsers();
      console.log("User deleted successfully:", res.data);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await axios.get(`${ACCOUNT_API_END_POINT}/get-all-users`, {
        withCredentials: true,
      });
      setUsers(res?.data?.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const applyFilterAndSearch = () => {
    let filtered = [...users];
    if (filter !== "all") {
      filtered = filtered.filter((user) => user.role === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  };

  return (
    <div className="container">
      {/* Filters & Search UI */}
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <h6 className="text-secondary fw-normal m-0">Sort by Role: </h6>
          <select
            className="form-select text-secondary"
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
            <button className="btn btn-primary" type="button">
              <i className="bi bi-search"></i> Search
            </button>
          </div>
        </div>
      </div>

      {/* Table UI */}
      <div style={{ maxHeight: "550px", overflowY: "auto" }}>
        <table className="table table-hover table-striped mt-2">
          <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <tr>
              <th className="small text-muted align-middle" scope="col">
                Name
              </th>
              <th className="small text-muted align-middle" scope="col">
                Email
              </th>
              <th className="small text-muted align-middle" scope="col">
                Role
              </th>
              <th className="small text-muted align-middle" scope="col">
                isBlocked
              </th>
              <th
                className="small text-muted align-middle text-center"
                scope="col"
              >
                Handle
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="small text-muted align-middle">
                    {user.firstName}
                  </td>
                  <td className="small text-muted align-middle">
                    {user.emailAddress}
                  </td>
                  <td className="small text-muted align-middle">{user.role}</td>
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
                          Block User
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
      </div>
    </div>
  );
};

export default RegularUsers;
