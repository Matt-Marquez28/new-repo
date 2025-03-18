import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import defaultProfile from "./default-profile.png";
import { NOTIFICATION_API_END_POINT } from "../../utils/constants";

const AdminHeader = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  const checkUnreadNotifications = async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API_END_POINT}/has-unread`, {
        withCredentials: true,
      });
      setHasUnread(res.data.hasUnread);
      console.log(res.data.hasUnread);
    } catch (error) {
      console.error("Error checking unread notifications:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${ACCOUNT_API_END_POINT}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.clear();
      triggerToast(res?.data?.message, "success");
      navigate("/");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const accountPopover = (
    <Popover id="account-popover">
      <Popover.Header as="h5">Account</Popover.Header>
      <Popover.Body>
        <ul className="list-unstyled mb-0">
          <li>
            <Button
              variant="link"
              className="text-decoration-none w-100 text-dark"
              onClick={() => navigate("settings")}
            >
              <i className="bi bi-gear-fill text-secondary"></i> Settings
            </Button>
          </li>
          <li>
            <Button
              variant="link"
              className="text-decoration-none w-100 text-start text-dark"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-left text-danger"></i> Logout
            </Button>
          </li>
        </ul>
      </Popover.Body>
    </Popover>
  );

  const notificationsPopover = (
    <Popover id="notifications-popover">
      <Popover.Header as="h5">Notifications</Popover.Header>
      <Popover.Body>
        <ul className="list-unstyled mb-0">
          <li>New job application received</li>
          <li>Profile update request pending</li>
          <li>System maintenance scheduled</li>
        </ul>
      </Popover.Body>
    </Popover>
  );

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
            <h5 className=" pt-serif-bold" style={{ color: "#555555" }}>
              PESO City of Taguig
            </h5>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
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
              <Nav.Link
                as={Link}
                to="/admin/dashboard"
                className="px-3 text-primary"
              >
                <i className="bi bi-house-door-fill"></i> Home
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              {/* Notifications Button */}
              {/* <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={notificationsPopover}
                rootClose
              > */}
              <Button
                onClick={() => {
                  setHasUnread(false); // Mark notifications as read
                  navigate("/admin/notification"); // Redirect
                }}
                variant="light"
                className={`bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2 position-relative ${
                  hasUnread ? "pulse-animation" : ""
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                {/* ✅ Red Bell when unread */}
                <i
                  className={`bi bi-bell-fill ${
                    hasUnread ? "text-danger swing-animation" : "text-secondary"
                  }`}
                ></i>

                <style jsx>{`
                  /* 🔴 Pulse Ring Effect */
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
                    animation: pulse-ring 2s ease-in-out infinite;
                  }

                  /* 🔔 Swinging Bell */
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
                    animation: swing 2s ease-in-out infinite;
                  }
                `}</style>
              </Button>
              {/* </OverlayTrigger> */}

              {/* Office Hours Link */}
              <Link className="d-flex align-items-center text-decoration-none text-secondary p-2 bg-white border rounded">
                <i className="bi bi-clock-fill fs-6 me-2 text-primary"></i>
                <span className="">
                  Office Hours: Mon - Fri 7:00 AM - 5:00 PM
                </span>
              </Link>

              {/* Account Dropdown */}
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={accountPopover}
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
    </Navbar>
  );
};

export default AdminHeader;
