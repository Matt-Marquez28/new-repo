import React from "react";
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
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import defaultProfile from "./default-profile.png";

export const EmployerHeader = () => {
  const triggerToast = useToast();
  const navigate = useNavigate();

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
      triggerToast(error?.response?.data?.message, "primary");
    }
  };

  const expand = "md";

  const accountPopover = (
    <Popover id="account-popover">
      <Popover.Header as="h5">Account</Popover.Header>
      <Popover.Body>
        <ul className="list-unstyled mb-0">
          <li>
            <Button
              variant="link"
              className="text-decoration-none w-100 text-dark"
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
              <NavDropdown
                title={
                  <>
                    <i className="bi bi-suitcase-lg-fill text-primary"></i>{" "}
                    <span className="text-primary"> Job Vacancy</span>{" "}
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
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={notificationsPopover}
                rootClose
              >
                <Button
                  variant="light"
                  className="bg-white border rounded-circle d-flex align-items-center justify-content-center p-0 mx-2"
                  style={{ width: "40px", height: "40px" }}
                >
                  <i className="bi bi-bell-fill text-secondary"></i>
                </Button>
              </OverlayTrigger>

              <Link className="d-flex align-items-center text-decoration-none text-secondary p-2 bg-white border rounded">
                <i className="bi bi-clock-fill fs-6 me-2 text-primary"></i>
                <span className="">
                  Office Hours: Mon - Fri 7:00 AM - 5:00 PM
                </span>
              </Link>

              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={accountPopover}
                rootClose
              >
                <div>
                  <img
                    src={defaultProfile} // Replace with the path to your image
                    alt="Dropdown"
                    style={{ width: "55px", height: "55px" }} // Adjust the size of the image
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
