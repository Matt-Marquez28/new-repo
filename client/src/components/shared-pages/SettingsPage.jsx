import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/user.context";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowModal(false);
    try {
      const res = await axios.put(
        `${ACCOUNT_API_END_POINT}/mark-for-deletion`,
        {},
        {
          withCredentials: true,
        }
      );
      alert(
        "Your account deletion request has been submitted. Your account will be deleted in 30 days."
      );
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  return (
    <div className="container pb-3">
      <div className="d-flex gap-2 my-2 align-items-center">
        <button onClick={() => navigate(-1)} className="btn btn-light">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h5 className="my-2 text-primary">Settings</h5>
      </div>
      <div className="row">
        {/* Card for Changing Password */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center">
                <i className="bi bi-lock-fill text-primary me-2"></i> Change
                Password
              </h5>
              <p className="card-text">
                Ensure your account is secure by updating your password
                regularly.
              </p>
              <Link to="change-password" className="btn btn-primary">
                Change Password
              </Link>
            </div>
          </div>
        </div>

        {/* Card for Deleting Account */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title d-flex align-items-center text-danger">
                <i className="bi bi-trash-fill me-2"></i> Delete Account
              </h5>
              <p className="card-text">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <button onClick={handleDeleteClick} className="btn btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your account? This action is
          irreversible, and your account will be permanently deleted after 30
          days.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Confirm Deletion
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SettingsPage;
