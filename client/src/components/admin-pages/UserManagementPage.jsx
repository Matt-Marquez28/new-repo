import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Dropdown,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";

const UserManagementPage = () => {
  const navigate = useNavigate();
  const triggerToast = useToast();
  const [users, setUsers] = useState([]); // State to store users fetched from the API
  const [modalShow, setModalShow] = useState(false);

  // Fetch all system users on component mount
  useEffect(() => {
    getAllSystemUsers();
  }, []);

  // Function to fetch all system users
  const getAllSystemUsers = async () => {
    try {
      const res = await axios.get(
        `${ACCOUNT_API_END_POINT}/get-all-system-users`
      );
      console.log(res?.data?.users);
      setUsers(res?.data?.users); // Update the users state with the fetched data
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (accountId) => {
    if (!accountId) return;

    const confirmation = window.confirm(
      `Are you sure you want to delete this user? ${accountId}`
    );
    if (!confirmation) return;

    try {
      const response = await axios.delete(
        `${ACCOUNT_API_END_POINT}/delete-system-user/${accountId}`
      );

      if (response.data.success) {
        triggerToast(response.data.message, "success");
        getAllSystemUsers(); // Refresh the user list
      } else {
        triggerToast(response.data.message, "danger");
      }
    } catch (error) {
      console.error(error);
      triggerToast("An error occurred while deleting the user.", "danger");
    }
  };

  // Dropdown content for action buttons
  const dropdownContent = (accountId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button">
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
      <Dropdown.Item as="button" onClick={() => deleteUser(accountId)}>
        <i className="bi bi-trash"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  // Function to get the badge variant based on the role
  const getBadgeVariant = (role) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Manager":
        return "warning";
      case "Staff":
      default:
        return "primary";
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container">
      <div className="d-flex gap-2 my-2 align-items-center">
        <button onClick={() => navigate(-1)} className="btn btn-light">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h4 className="my-2 text-primary">
          <i className="bi bi-people-fill"></i> Manage Staff
        </h4>
      </div>

      <div className="d-flex justify-content-end">
        <Button className="btn btn-primary" onClick={() => setModalShow(true)}>
          <i className="bi bi-person-fill-add"></i> Create New User
        </Button>
      </div>

      {/* Table Container with Scrollable Body */}
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        <div style={{ minWidth: "800px" }}>
          {" "}
          {/* Minimum width to trigger horizontal scroll */}
          <table className="table table-hover mt-2" style={{ width: "100%" }}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  scope="col"
                  className="small text-muted align-middle"
                  style={{ width: "25%" }}
                >
                  <i className="bi bi-people-fill"></i> Full Name
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle"
                  style={{ width: "25%" }}
                >
                  <i className="bi bi-envelope-fill"></i> Email
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle"
                  style={{ width: "20%" }}
                >
                  <i className="bi bi-calendar-fill"></i> Date Created
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle text-center"
                  style={{ width: "15%" }}
                >
                  <i className="bi bi-gear-fill"></i> Role
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle text-center"
                  style={{ width: "15%" }}
                >
                  <i className="bi bi-hand-index-thumb-fill"></i> Handle
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td
                      scope="row"
                      className="small text-muted align-middle fw-semibold"
                      style={{ width: "25%" }}
                    >
                      {`${user?.firstName} ${user?.lastName}`}
                    </td>
                    <td
                      className="small text-muted align-middle"
                      style={{ width: "25%" }}
                    >
                      {user?.emailAddress}
                    </td>
                    <td
                      className="small text-muted align-middle"
                      style={{ width: "20%" }}
                    >
                      {formatDate(user?.createdAt)}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      <Badge bg={getBadgeVariant(user?.role)}>
                        {user?.role}
                      </Badge>
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          className="text-secondary btn-sm"
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </Dropdown.Toggle>
                        {dropdownContent(user?._id)}
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding Staff */}
      <AddStaffModal
        show={modalShow}
        onHide={() => setModalShow(false)} // Pass the onHide prop correctly
        getAllSystemUsers={getAllSystemUsers} // Pass the function as a prop
      />
    </div>
  );
};

const AddStaffModal = ({ show, onHide, getAllSystemUsers }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff");
  const triggerToast = useToast();

  // Function to handle form submission
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (!emailAddress || !password) {
      alert("Please fill out both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        `${ACCOUNT_API_END_POINT}/create-new-system-user`,
        {
          firstName,
          lastName,
          emailAddress,
          password,
          role,
        }
      );

      if (response.data.success) {
        // Refresh the user list after creating a new user
        await getAllSystemUsers();
        triggerToast(response?.data?.message, "success");
        onHide(); // Close the modal
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      triggerToast(error?.response?.data?.message, "danger");
      alert("An error occurred while creating the user.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-primary" closeButton>
        <Modal.Title className="text-light">Create New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          {/* Modal Footer with Form Submission */}
          <Modal.Footer className="mt-3">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Staff
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserManagementPage;
