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
  const [users, setUsers] = useState([]);
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    getAllSystemUsers();
  }, []);

  const getAllSystemUsers = async () => {
    try {
      const res = await axios.get(
        `${ACCOUNT_API_END_POINT}/get-all-system-users`
      );
      console.log(res.data);
      setUsers(res?.data?.users);
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
        getAllSystemUsers();
      } else {
        triggerToast(response.data.message, "danger");
      }
    } catch (error) {
      console.error(error);
      triggerToast("An error occurred while deleting the user.", "danger");
    }
  };

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

  const getBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "primary";
      case "staff":
      default:
        return "info";
    }
  };

  const formatRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "staff":
        return "Staff";
      default:
        return role;
    }
  };

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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#1a4798",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <i className="bi bi-person-fill-gear text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Manage Administrator / Staff Account.
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Manage all upcoming and past job fair events
          </p>
        </div>
        <Button
          className="btn"
          style={{ backgroundColor: "#1a4798", borderColor: "#1a4798" }}
          onClick={() => setModalShow(true)}
        >
          <i className="bi bi-person-fill-add"></i> Create New User
        </Button>
      </div>

      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        <div style={{ minWidth: "800px" }}>
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
                      className="small text-primary align-middle fw-semibold"
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
                        {formatRoleDisplay(user?.role)}
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

      <AddStaffModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        getAllSystemUsers={getAllSystemUsers}
      />
    </div>
  );
};

const AddStaffModal = ({ show, onHide, getAllSystemUsers }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "staff", label: "Staff" },
  ];
  const triggerToast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!emailAddress || !password || !role) {
      triggerToast("Please fill out all required fields.", "warning");
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
        await getAllSystemUsers();
        triggerToast(response?.data?.message, "success");
        onHide();
        // Reset form fields
        setFirstName("");
        setLastName("");
        setEmailAddress("");
        setPassword("");
        setRole("staff");
      } else {
        triggerToast(response.data.message, "danger");
      }
    } catch (error) {
      console.error(error);
      triggerToast(
        error?.response?.data?.message ||
          "An error occurred while creating the user.",
        "danger"
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header
        className=""
        style={{ backgroundColor: "#1a4798" }}
        closeButton
      >
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
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              {roles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Modal.Footer className="mt-3">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserManagementPage;
