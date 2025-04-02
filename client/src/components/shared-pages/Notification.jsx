import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Spinner, Badge, Row, Col, Button } from "react-bootstrap";
import { useSocketContext } from "../../contexts/socket.context";
import { NOTIFICATION_API_END_POINT } from "../../utils/constants";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket] = useSocketContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();

    if (!socket) return;

    socket.on("notification", (newNotification) => {
      setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
      ]);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${NOTIFICATION_API_END_POINT}/get-all-notifications`,
        { withCredentials: true }
      );
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNotification = async (id) => {
    try {
      await axios.delete(
        `${NOTIFICATION_API_END_POINT}/delete-notification/${id}`,
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${NOTIFICATION_API_END_POINT}/mark-all-as-read`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(
        `${NOTIFICATION_API_END_POINT}/clear-all-notifications`,
        { withCredentials: true }
      );
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <div className="container-fluid container-md">
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex gap-2 my-2 align-items-center">
            <button onClick={() => navigate(-1)} className="btn btn-light">
              <i class="bi bi-arrow-left"></i>
            </button>
            <h5 className="my-2 text-primary">
              <i className="bi bi-bell-fill"></i> Notifications
            </h5>
          </div>
        </Col>
        <Col xs="auto">
          {notifications.length > 0 && (
            <Badge bg="primary" pill>
              {notifications.length}
            </Badge>
          )}
        </Col>
      </Row>

      {loading ? (
        <div className="text-center p-4 border rounded-3">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center p-4 border rounded-3">
          <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
          <p className="text-muted">No notifications available</p>
        </div>
      ) : (
        <div className="card border bg-light rounded-3">
          <div className="card-body p-0">
            {notifications.map((notification, index) => (
              <div
                key={notification._id}
                className={`p-3 ${
                  index !== notifications.length - 1 ? "border-bottom" : ""
                } ${!notification.isRead ? "bg-white shadow-sm" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (notification.link) {
                    navigate(notification.link);
                  }
                }}
              >
                <Row className="align-items-start g-3">
                  <Col xs="auto">
                    <i
                      className={`bi ${
                        notification.type === "success"
                          ? "bi-check-circle-fill text-success"
                          : notification.type === "warning"
                          ? "bi-exclamation-triangle-fill text-warning"
                          : notification.type === "error"
                          ? "bi-x-circle-fill text-danger"
                          : "bi-info-circle-fill text-primary"
                      } fs-4`}
                    ></i>
                  </Col>

                  <Col>
                    <Row className="mb-1">
                      <Col xs={12} md>
                        <h6 className="mb-1 fw-bold d-flex align-items-center flex-wrap">
                          {notification.title}
                          <Badge
                            bg={
                              notification.type === "success"
                                ? "success"
                                : notification.type === "warning"
                                ? "warning"
                                : notification.type === "error"
                                ? "danger"
                                : "primary"
                            }
                            className="ms-2 text-uppercase"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {notification.type}
                          </Badge>
                        </h6>
                      </Col>
                      <Col xs={12} md="auto">
                        <small className="text-muted d-block">
                          {moment(notification.createdAt).fromNow()}
                        </small>
                      </Col>
                    </Row>

                    <p
                      className="mb-2 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {notification.message}
                    </p>

                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-danger border"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNotification(notification._id);
                        }}
                      >
                        <i className="bi bi-trash-fill me-1"></i>
                        <span className="d-none d-sm-inline">Remove</span>
                      </button>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
