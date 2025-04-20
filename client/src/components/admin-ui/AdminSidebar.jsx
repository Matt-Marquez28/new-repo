import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../../contexts/user.context";

const AdminSidebar = () => {
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapsed state

  // Define active link styles here
  const activeLinkStyle = {
    backgroundColor: "#007BFF", // Example active background
    color: "#fff", // Example active text color
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="d-flex" style={{ overflow: "scroll initial" }}>
      <div
        className={`d-none d-md-flex flex-column flex-shrink-0 p-3 bg-light border`}
        style={{
          width: isCollapsed ? "80px" : "280px",
          transition: "width 0.3s",
        }}
      >
        {/* MENU Heading */}
        <div className="text-center">
          <h5>{!isCollapsed && "MENU"}</h5>
        </div>

        {/* Toggle Button */}
        <div className="text-center">
          <button
            className="btn btn-link text-decoration-none p-0"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <i
              className={`bi ${
                isCollapsed ? "bi bi-toggle-off" : "bi bi-toggle-on"
              } fs-4`}
            ></i>
          </button>
        </div>

        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink
              exact
              to="/admin/dashboard"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
              })}
            >
              <i className="bi bi-columns me-2"></i>
              {!isCollapsed && "Dashboard"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="verification/company"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
              })}
            >
              <i className="bi bi-building me-2"></i>
              {!isCollapsed && "Company Verification"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="verification/job-vacancy"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
              })}
            >
              <i className="bi bi-briefcase me-2"></i>
              {!isCollapsed && "Job Vacancy Verification"}
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              exact
              to="/analytics"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
              })}
            >
              <i className="bi bi-bar-chart-line me-2"></i>
              {!isCollapsed && "Analytics"}
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              exact
              to="audit-trail"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
              })}
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {!isCollapsed && "Audit Trail"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="job-fair"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
                ...(user.accountData.role === "staff"
                  ? { pointerEvents: "none", color: "#ccc" } // Disabled styles
                  : {}),
              })}
            >
              <i className="bi bi-flag me-2"></i>
              {!isCollapsed && "Job Fair"}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="user-management/user-option"
              className="nav-link"
              style={({ isActive }) => ({
                ...(isActive ? activeLinkStyle : {}),
                margin: "8px 0", // Increased vertical margin
                padding: "8px 12px", // Padding
                ...(user.accountData.role === "staff"
                  ? { pointerEvents: "none", color: "#ccc" } // Disabled styles
                  : {}),
              })}
            >
              <i className="bi bi-people me-2"></i>
              {!isCollapsed && "Manage User"}
            </NavLink>
          </li>
        </ul>
        <hr />
        <div className="text-center">
          <div style={{ padding: "20px 5px" }}>
            {!isCollapsed && (
              <h5 className="text-capitalize text-primary">
                {user?.accountData?.role}
              </h5>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
