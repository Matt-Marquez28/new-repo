import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Dropdown } from "react-bootstrap";

const UsersPage = () => {
  // Sample data for users
  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: "Matt Marquez",
      email: "mattjovan99@gmail.com",
      role: "Staff",
    },
    {
      id: 2,
      fullName: "Jacob Thornton",
      email: "jacob@example.com",
      role: "Staff",
    },
    {
      id: 3,
      fullName: "Larry the Bird",
      email: "larry@example.com",
      role: "Staff",
    },
  ]);

  const [modalShow, setModalShow] = useState(false);

  // Dropdown content for action buttons
  const dropdownContent = () => (
    <Dropdown.Menu>
      <Dropdown.Item as="button">
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
      <Dropdown.Item as="button">
        <i className="bi bi-trash"></i> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  return (
    <div>
      <div className="d-flex justify-content-end">
        <Button className="btn btn-primary" onClick={() => setModalShow(true)}>
          <i className="bi bi-person-fill-add"></i> Create New User
        </Button>
      </div>

      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-people-fill"></i> Full Name
            </th>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-envelope-at-fill"></i> Email
            </th>
            <th scope="col" className="small text-muted align-middle">
              <i className="bi bi-person-fill-gear"></i> Role
            </th>
            <th
              scope="col"
              className="small text-muted align-middle text-center"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td scope="row" className="small text-muted align-middle">
                {user.fullName}
              </td>
              <td className="small text-muted align-middle">{user.email}</td>
              <td className="small text-muted align-middle">{user.role}</td>
              <td className="small text-muted align-middle text-center">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    className="text-secondary btn-sm"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </Dropdown.Toggle>
                  {dropdownContent()}
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Adding Staff */}
      <AddStaffModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onSave={(newUser) => setUsers([...users, newUser])}
      />
    </div>
  );
};

const AddStaffModal = ({ show, onHide, onSave }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Staff");

  // Generate default email based on first and last name
  const generateEmail = () => {
    return (
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com` || ""
    );
  };

  const handleSave = () => {
    const newUser = {
      id: Date.now(), // Simple unique ID
      fullName: `${firstName} ${lastName}`,
      email: generateEmail(),
      role,
    };
    onSave(newUser);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Staff</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
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
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Default Email</Form.Label>
                <Form.Control type="text" value={generateEmail()} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group>
            <Form.Label>Assign Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Staff">Staff</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Staff
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UsersPage;
