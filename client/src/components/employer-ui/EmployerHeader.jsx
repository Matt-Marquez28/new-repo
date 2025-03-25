import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ACCOUNT_API_END_POINT,
  NOTIFICATION_API_END_POINT,
} from "../../utils/constants";
import defaultProfile from "./default-profile.png";
import { useSocketContext } from "../../contexts/socket.context"; // ✅ Import socket context

export const EmployerHeader = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const [socket] = useSocketContext(); // ✅ Get socket instance
  const [hasUnread, setHasUnread] = useState(false);

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
        socket.off("notification"); // Clean up event listener on unmount
      };
    }
  }, [socket]);

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

  return (
    <Navbar expand={expand} className="bg-body-tertiary m-0 border-bottom">
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
            {/* Hide text on small screens */}
            <h5
              className="pt-serif-bold d-none d-md-block"
              style={{ color: "#555555" }}
            >
              PESO City of Taguig
            </h5>
          </Link>
        </Navbar.Brand>

        {/* Notification Button (Visible on all screens) */}
        <div className="d-flex align-items-center">
          {/* Notification Button on Small Screens (Near Hamburger) */}
          <Button
            onClick={() => {
              setHasUnread(false);
              navigate("/employer/notification");
            }}
            variant="light"
            className={`bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2 position-relative d-md-none ${
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

          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
        </div>

        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-${expand}`}
          aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-center align-items-center flex-grow-1 pe-3">
              <NavDropdown
                title={
                  <>
                    <i className="bi bi-suitcase-lg-fill text-primary"></i>{" "}
                    <span className="text-primary"> Job Vacancy</span>
                  </>
                }
                id={`offcanvasNavbarDropdown-expand-${expand}`}
              >
                <NavDropdown.Item as={Link} to="job-vacancy">
                  <i className="bi bi-clipboard"></i> Post Job Vacancy
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/action2">
                  <i className="bi bi-suitcase-lg"></i> My Job Vacancies
                </NavDropdown.Item>
                <NavDropdown.Divider />
              </NavDropdown>
              <Nav.Link
                as={Link}
                to="company-profile"
                className="px-3 text-primary"
              >
                <i className="bi bi-building-fill"></i> Company Profile
              </Nav.Link>
            </Nav>

            <div className="d-flex align-items-center gap-3">
              {/* Notification Button on Larger Screens (Next to Office Hours) */}
              <Button
                onClick={() => {
                  setHasUnread(false);
                  navigate("/employer/notification");
                }}
                variant="light"
                className={`bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2 position-relative d-none d-md-flex ${
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
                            onClick={() => navigate("/employer/settings")}
                            variant="link"
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
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>

      {/* ✅ Restored animations */}
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
