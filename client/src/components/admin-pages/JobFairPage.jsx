import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useNavigate } from "react-router-dom";

const JobFairAdminPage = () => {
  const navigate = useNavigate();
  const triggerToast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [jobSeekerCount, setJobSeekerCount] = useState(0);
  const [employerCount, setEmployerCount] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    registrationDeadline: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch real data from backend
  useEffect(() => {
    fetchEvents();
    getAllPreRegistered();
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-job-fair-events`
      );
      setEvents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setLoading(false);
    }
  };

  const getAllPreRegistered = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-pre-registered`,
        { withCredentials: true }
      );
      console.log(res?.data?.preRegistration);
      const preregs = res?.data?.preregs || [];

      // Count roles
      setJobSeekerCount(preregs.filter((p) => p.role === "jobseeker").length);
      setEmployerCount(preregs.filter((p) => p.role === "employer").length);
    } catch (error) {
      console.log(error);
    }
  };

  // Filter events based on search and status
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && event.isActive) ||
      (statusFilter === "inactive" && !event.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      date: event.date.split("T")[0], // Format date for input
      time: event.time || "",
      venue: event.venue,
      description: event.description,
      registrationDeadline: event.registrationDeadline?.split("T")[0] || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(
          `${JOB_VACANCY_API_END_POINT}/delete-job-fair-event/${id}`
        );
        // setEvents(events.filter((event) => event._id !== id));
        fetchEvents();
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEvent) {
        // Update existing event
        const res = await axios.put(
          `${JOB_VACANCY_API_END_POINT}/update-job-fair-event/${currentEvent._id}`,
          formData
        );
        // setEvents(
        //   events.map((event) =>
        //     event._id === currentEvent._id ? response.data.data : event
        //   )
        // );
        fetchEvents();
        triggerToast(res?.data?.message, "success");
      } else {
        // Add new event
        const res = await axios.post(
          `${JOB_VACANCY_API_END_POINT}/create-job-fair-event`,
          formData,
          { withCredentials: true }
        );
        // setEvents([...events, response.data.data]);
        fetchEvents();
        triggerToast(res?.data?.message, "success");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save event:", error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const toggleEventStatus = async (id) => {
  //   try {
  //     const event = events.find((e) => e._id === id);
  //     const response = await axios.patch(`/api/job-fair-events/${id}/status`, {
  //       isActive: !event.isActive,
  //     });
  //     setEvents(
  //       events.map((event) => (event._id === id ? response.data.data : event))
  //     );
  //   } catch (error) {
  //     console.error("Failed to toggle event status:", error);
  //   }
  // };

  const toggleActivation = async (id) => {
    try {
      const res = await axios.put(
        `${JOB_VACANCY_API_END_POINT}/toggle-job-fair-activation/${id}`,
        {}, // Empty body to satisfy PATCH/PUT request
        { withCredentials: true } // Needed for session-based APIs
      );

      if (res.status >= 200 && res.status < 300) {
        console.log("Toggled successfully:", res.data);
        fetchEvents(); // Refresh your event list
      } else {
        console.error("Unexpected response:", res);
      }
    } catch (error) {
      console.error(
        "Failed to toggle event status:",
        error.response?.data || error.message
      );
      alert("Failed to toggle status. Please try again.");
    }
  };

  // Calculate statistics
  const totalEvents = events.length;
  const activeEmployers = events.reduce(
    (sum, event) =>
      sum + (event.isActive ? event.registeredEmployers?.length || 0 : 0),
    0
  );
  const activeJobSeekers = events.reduce(
    (sum, event) =>
      sum + (event.isActive ? event.registeredJobSeekers?.length || 0 : 0),
    0
  );

  return (
    <div className="container">
      {/* Page Header with Stats */}
      {/* <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h1 className="h3 fw-bold">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            Job Fair Event Management
          </h1>
          <p className="text-muted mb-0">
            Manage all upcoming and past job fair events
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => {
            setCurrentEvent(null);
            setFormData({
              title: "",
              date: "",
              time: "",
              venue: "",
              description: "",
              registrationDeadline: "",
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add New Event
        </button>
      </div> */}
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
              <i className="bi bi-flag-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Job Fair Management
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Manage all upcoming and past job fair events
          </p>
        </div>
        <button
          className="btn d-flex align-items-center text-white"
          style={{ backgroundColor: "#1a4798" }}
          onClick={() => {
            setCurrentEvent(null);
            setFormData({
              title: "",
              date: "",
              time: "",
              venue: "",
              description: "",
              registrationDeadline: "",
            });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-calendar-check text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Events</h6>
                  <h3 className="mb-0">{totalEvents}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-building text-success fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Registered Employers</h6>
                  <h3 className="mb-0">{employerCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-people text-info fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Registered Job Seekers</h6>
                  <h3 className="mb-0">{jobSeekerCount}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary w-100">
                <i className="bi bi-funnel me-2"></i>
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x text-muted fs-1"></i>
              <h5 className="mt-3">No events found</h5>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }} className="fw-normal">
                      Event Details
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      Date & Time
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      Venue
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Employers
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Job Seekers
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Status
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="bi bi-calendar-event text-primary"></i>
                          </div>
                          <div>
                            <h6 className="mb-1 text-primary fw-semibold">
                              {event.title}
                            </h6>
                            <p className="text-muted small mb-0">
                              {event.description?.substring(0, 60) ||
                                "No description"}
                              ...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <small className="text-muted">
                            {event.time || "All day"}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt text-muted me-2"></i>
                          <span>{event.venue}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                          {event.registeredEmployers?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                          {event.registeredJobSeekers?.length || 0}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={event.isActive}
                            onChange={(e) => {
                              e.preventDefault();
                              toggleActivation(event._id);
                            }}
                          />
                          <label className="form-check-label">
                            {event.isActive ? "Active" : "Inactive"}
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-sm btn-outline-primary me-2 d-flex align-items-center"
                            onClick={() => handleEdit(event)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center me-2"
                            onClick={() => handleDelete(event._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center"
                            onClick={() => navigate(`details/${event._id}`)}
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-semibold">
                  <i
                    className={`bi ${
                      currentEvent ? "bi-pencil-square" : "bi-plus-circle"
                    } me-2`}
                  ></i>
                  {currentEvent ? "Edit Event" : "Create New Event"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Event Title*
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Tech Careers Summit 2024"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Venue*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        placeholder="Convention Center, Hall A"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Date*</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Time*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        placeholder="9:00 AM - 5:00 PM"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Registration Deadline*
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Description*
                      </label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Detailed description about the event..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {currentEvent ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFairAdminPage;
