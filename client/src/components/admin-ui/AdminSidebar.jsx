import React, { useState } from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from "cdbreact";
import { NavLink } from "react-router-dom";
import { useUser } from "../../contexts/user.context";

const AdminSidebar = () => {
  const { user } = useUser();

  // Define active link styles here
  const activeLinkStyle = {
    backgroundColor: "#007BFF", // Example active background
  };

  return (
    <div style={{ display: "flex", overflow: "scroll initial" }}>
      <CDBSidebar textColor="#333" backgroundColor="#F8F9FA" className="border">
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
          <a
            href="/"
            className="text-decoration-none"
            style={{ color: "inherit" }}
          >
            Menu
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <NavLink
              exact
              to="/admin/dashboard"
              style={({ isActive }) => (isActive ? activeLinkStyle : {})}
            >
              <CDBSidebarMenuItem icon="columns">Dashboard</CDBSidebarMenuItem>
            </NavLink>

            <NavLink
              exact
              to="verification/company"
              style={({ isActive }) => (isActive ? activeLinkStyle : {})}
            >
              <CDBSidebarMenuItem icon="building">
                Company Verification
              </CDBSidebarMenuItem>
            </NavLink>

            <NavLink
              exact
              to="verification/job-vacancy"
              style={({ isActive }) => (isActive ? activeLinkStyle : {})}
            >
              <CDBSidebarMenuItem icon="briefcase">
                Job Vacancy Verification
              </CDBSidebarMenuItem>
            </NavLink>

            <NavLink
              exact
              to="user-management"
              style={({ isActive }) =>
                user.accountData.role === "staff"
                  ? { pointerEvents: "none", color: "#ccc" } // Disabled styles
                  : isActive
                  ? activeLinkStyle
                  : {}
              }
            >
              <CDBSidebarMenuItem
                icon="users"
                style={{
                  color: user.accountData.role === "staff" ? "#ccc" : undefined, // Adjust text color
                }}
              >
                Manage User
              </CDBSidebarMenuItem>
            </NavLink>

            <NavLink
              exact
              to="/analytics"
              style={({ isActive }) => (isActive ? activeLinkStyle : {})}
            >
              <CDBSidebarMenuItem icon="chart-line">
                Analytics
              </CDBSidebarMenuItem>
            </NavLink>

            <NavLink
              exact
              to="audit-trail"
              style={({ isActive }) => (isActive ? activeLinkStyle : {})}
            >
              <CDBSidebarMenuItem icon="exclamation-circle">
                Audit Trail
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div
            style={{
              padding: "20px 5px",
            }}
          >
            Sidebar Footer
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default AdminSidebar;
