import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ACCOUNT_API_END_POINT,
  NOTIFICATION_API_END_POINT,
} from "../../utils/constants";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { useSocketContext } from "../../contexts/socket.context";
import { useUser } from "../../contexts/user.context";
import defaultProfile from "./default-profile.png";

const AdminHeader = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const [socket] = useSocketContext();
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navbarRef = useRef();

  useEffect(() => {
    checkUnreadNotifications();

    if (socket) {
      socket.on("notification", (notification) => {
        console.log("🔔 New Notification:", notification);
        setHasUnread(true);
        triggerToast(
          `📢 ${notification.title}: ${notification.message}`,
          "primary"
        );
      });

      return () => {
        socket.off("notification");
      };
    }
  }, [socket, triggerToast]);

  const checkUnreadNotifications = async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API_END_POINT}/has-unread`, {
        withCredentials: true,
      });
      setHasUnread(res.data.hasUnread);
    } catch (error) {
      console.error("Error checking unread notifications:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${ACCOUNT_API_END_POINT}/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      triggerToast(res?.data?.message, "primary");
      navigate("/");
    } catch (error) {
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const expand = "md";

  const handleNavigation = (path) => {
    try {
      const absolutePath = path.startsWith("/") ? path : `/${path}`;
      navigate(absolutePath);
      setShowOffcanvas(false); // Close offcanvas on navigation
    } catch (error) {
      console.error("Navigation error:", error);
      triggerToast("Failed to navigate", "danger");
    }
  };

  // Define active link styles here
  const activeLinkStyle = {
    backgroundColor: "#007BFF",
    color: "#fff",
  };

  return (
    <Navbar
      expand={expand}
      className="bg-body-tertiary m-0 border-bottom"
      expanded={showOffcanvas}
      onToggle={() => setShowOffcanvas(!showOffcanvas)}
      ref={navbarRef}
    >
      <Container fluid>
        <Navbar.Brand>
          <Link
            to="/"
            className="d-flex align-items-center link-body-emphasis text-decoration-none"
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s"
              alt="Logo"
              width="50"
              height="50"
              className="me-2"
            />
            <h5
              className="pt-serif-bold d-none d-md-block"
              style={{ color: "#555555" }}
            >
              PESO City of Taguig
            </h5>
          </Link>
        </Navbar.Brand>

        {/* Desktop View (md and up) */}
        <div className="d-none d-md-flex align-items-center gap-3">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/admin/dashboard"
              className="px-3 text-primary"
            >
              <i className="bi bi-house-door-fill"></i> Home
            </Nav.Link>
          </Nav>

          <Button
            onClick={() => handleNavigation("/admin/notification")}
            variant="light"
            className={`bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2 position-relative ${
              hasUnread ? "pulse-animation" : ""
            }`}
            style={{ width: "40px", height: "40px" }}
          >
            <i
              className={`bi bi-bell-fill ${
                hasUnread ? "text-danger swing-animation" : "text-secondary"
              }`}
            ></i>
          </Button>

          <Link className="d-flex align-items-center text-decoration-none text-secondary p-2 bg-white border rounded">
            <i className="bi bi-clock-fill fs-6 me-2 text-primary"></i>
            <span>Office Hours: Mon - Fri 7:00 AM - 5:00 PM</span>
          </Link>

          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={
              <Popover id="account-popover">
                <Popover.Header as="h5">Account</Popover.Header>
                <Popover.Body>
                  <ul className="list-unstyled mb-0">
                    <li>
                      <Button
                        variant="link"
                        onClick={() => handleNavigation("/admin/settings")}
                        className="text-decoration-none w-100 text-dark"
                      >
                        <i className="bi bi-gear-fill text-secondary"></i>{" "}
                        Settings
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        className="text-decoration-none w-100 text-start text-dark"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-left text-danger"></i>{" "}
                        Logout
                      </Button>
                    </li>
                  </ul>
                </Popover.Body>
              </Popover>
            }
            rootClose
          >
            <div>
              <img
                src={defaultProfile}
                alt="Dropdown"
                style={{ width: "55px", height: "55px" }}
              />
            </div>
          </OverlayTrigger>
        </div>

        {/* Mobile View (sm and down) */}
        <div className="d-flex d-md-none align-items-center">
          <Button
            onClick={() => handleNavigation("/admin/notification")}
            variant="light"
            className={`bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2 position-relative ${
              hasUnread ? "pulse-animation" : ""
            }`}
            style={{ width: "40px", height: "40px" }}
          >
            <i
              className={`bi bi-bell-fill ${
                hasUnread ? "text-danger swing-animation" : "text-secondary"
              }`}
            ></i>
          </Button>

          <Navbar.Toggle
            aria-controls={`offcanvasNavbar-expand-${expand}`}
            onClick={() => setShowOffcanvas(!showOffcanvas)}
          />
        </div>

        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-${expand}`}
          aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
          placement="end"
          className="d-md-none"
          show={showOffcanvas}
          onHide={() => setShowOffcanvas(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="d-flex flex-column justify-content-between">
            <div>
              <Nav className="flex-column gap-2">
                <NavLink
                  exact
                  to="/admin/dashboard"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-columns me-2"></i>
                  Dashboard
                </NavLink>
                
                <NavLink
                  exact
                  to="/admin/verification/company"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-building me-2"></i>
                  Company Verification
                </NavLink>
                
                <NavLink
                  exact
                  to="/admin/verification/job-vacancy"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-briefcase me-2"></i>
                  Job Vacancy Verification
                </NavLink>
                
                <NavLink
                  exact
                  to="/admin/analytics"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-bar-chart-line me-2"></i>
                  Analytics
                </NavLink>
                
                <NavLink
                  exact
                  to="/admin/audit-trail"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-exclamation-circle me-2"></i>
                  Audit Trail
                </NavLink>
                
                <NavLink
                  exact
                  to="/admin/user-management/user-option"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                    ...(user?.accountData?.role === "staff"
                      ? { pointerEvents: "none", color: "#ccc" }
                      : {}),
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-people me-2"></i>
                  Manage User
                </NavLink>
                
                <NavLink
                  as={Link}
                  to="/admin/notification"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => {
                    setHasUnread(false);
                    setShowOffcanvas(false);
                  }}
                >
                  <i className="bi bi-bell-fill me-2"></i> Notifications
                  {hasUnread && (
                    <span className="ms-2 badge bg-danger">New</span>
                  )}
                </NavLink>
                
                <NavLink
                  as={Link}
                  to="/admin/settings"
                  className="nav-link px-3 py-2 rounded"
                  style={({ isActive }) => ({
                    ...(isActive ? activeLinkStyle : {}),
                    margin: "8px 0",
                  })}
                  onClick={() => setShowOffcanvas(false)}
                >
                  <i className="bi bi-gear-fill me-2"></i> Settings
                </NavLink>
              </Nav>
            </div>

            <div className="border-top pt-3">
              <div className="d-flex align-items-center mb-3 px-3 text-secondary">
                <i className="bi bi-clock-fill fs-6 me-2 text-primary"></i>
                <span>Office Hours: Mon - Fri 7:00 AM - 5:00 PM</span>
              </div>

              <Button
                variant="outline-danger"
                onClick={() => {
                  handleLogout();
                  setShowOffcanvas(false);
                }}
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-box-arrow-left me-2"></i> Logout
              </Button>
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        .pulse-animation {
          animation: pulse-ring 1s ease-in-out infinite;
        }

        @keyframes swing {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
          75% {
            transform: rotate(-5deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .swing-animation {
          animation: swing 1s ease-in-out infinite;
        }
      `}</style>
    </Navbar>
  );
};

export default AdminHeader;