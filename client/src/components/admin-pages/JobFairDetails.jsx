import React, { useState, useEffect } from "react";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useParams } from "react-router-dom";

const JobFairDetails = () => {
  const { eventId } = useParams();

  const [activeTab, setActiveTab] = useState("preregs");
  const [preRegs, setPreRegs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState({
    preRegs: true,
    attendance: true,
  });

  const [stats, setStats] = useState({
    totalPreRegs: 0,
    totalAttendance: 0,
    jobSeekersPreRegs: 0,
    employersPreRegs: 0,
    attendanceRate: 0,
  });

  // Search and filter states
  const [preRegsSearch, setPreRegsSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState("all");
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("all");

  useEffect(() => {
    getAllPreRegs();
    getAllAttendance();
  }, []);

  useEffect(() => {
    if (preRegs.length > 0 || attendance.length > 0) {
      const jobSeekers = preRegs.filter(
        (reg) => reg.role === "jobseeker"
      ).length;
      const employers = preRegs.filter((reg) => reg.role === "employer").length;
      const attendanceRate =
        preRegs.length > 0
          ? Math.round((attendance.length / preRegs.length) * 100)
          : 0;

      setStats({
        totalPreRegs: preRegs.length,
        totalAttendance: attendance.length,
        jobSeekersPreRegs: jobSeekers,
        employersPreRegs: employers,
        attendanceRate,
      });
    }
  }, [preRegs, attendance]);

  const getAllPreRegs = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-preregs-by-id/${eventId}`
      );
      setPreRegs(res?.data?.preregs || []);
      setLoading((prev) => ({ ...prev, preRegs: false }));
    } catch (error) {
      console.log(error);
      setLoading((prev) => ({ ...prev, preRegs: false }));
    }
  };

  const getAllAttendance = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-attendance/${eventId}`
      );
      setAttendance(res?.data?.attendance || []);
      setLoading((prev) => ({ ...prev, attendance: false }));
      console.log(res?.data?.attendance);
    } catch (error) {
      console.log(error);
      setLoading((prev) => ({ ...prev, attendance: false }));
    }
  };

  const filterPreRegistrations = () => {
    let filtered = [...preRegs];

    if (preRegsSearch) {
      const searchTerm = preRegsSearch.toLowerCase();
      filtered = filtered.filter((reg) => {
        const jobSeekerInfo = reg?.jobSeekerId?.personalInformation || {};
        const employerInfo = reg?.employerId?.companyInformation || {};

        return (
          jobSeekerInfo.firstName?.toLowerCase().includes(searchTerm) ||
          jobSeekerInfo.lastName?.toLowerCase().includes(searchTerm) ||
          employerInfo.businessName?.toLowerCase().includes(searchTerm) ||
          reg.email?.toLowerCase().includes(searchTerm) ||
          reg.phone?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Rest of your filters...
    return filtered;
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (attendanceSearch) {
      const searchTerm = attendanceSearch.toLowerCase();
      filtered = filtered.filter((record) => {
        const user = record.user || record;
        const jobSeekerInfo = user?.jobSeekerId?.personalInformation || {};
        const employerInfo = user?.employerId?.companyInformation || {};

        return (
          jobSeekerInfo.firstName?.toLowerCase().includes(searchTerm) ||
          jobSeekerInfo.lastName?.toLowerCase().includes(searchTerm) ||
          employerInfo.businessName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Rest of your filters...
    return filtered;
  };

  const renderSearchAndFilters = () => (
    <div className="row mb-3">
      <div className="col-md-6 mb-2 mb-md-0">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search pre-registrations..."
            value={preRegsSearch}
            onChange={(e) => setPreRegsSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-3 mb-2 mb-md-0">
        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="jobseeker">Job Seekers</option>
          <option value="employer">Employers</option>
        </select>
      </div>
      <div className="col-md-3">
        <select
          className="form-select"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>
    </div>
  );

  const renderAttendanceSearch = () => (
    <div className="row mb-3">
      <div className="col-md-4 mb-2 mb-md-0">
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search attendance..."
            value={attendanceSearch}
            onChange={(e) => setAttendanceSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="col-md-4 mb-2 mb-md-0">
        <select
          className="form-select"
          value={attendanceRoleFilter}
          onChange={(e) => setAttendanceRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="jobseeker">Job Seekers</option>
          <option value="employer">Employers</option>
        </select>
      </div>
      <div className="col-md-4">
        <select
          className="form-select"
          value={attendanceDateFilter}
          onChange={(e) => setAttendanceDateFilter(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>
    </div>
  );

  const renderPreRegsTable = () => {
    const filteredPreRegs = filterPreRegistrations();

    return (
      <>
        {renderSearchAndFilters()}
        {loading.preRegs ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredPreRegs.length === 0 ? (
          <div className="alert alert-info">
            No pre-registrations found matching your criteria
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th className="fw-normal">Job Seeker / Company</th>
                  <th className="fw-normal">Role</th>
                  <th className="fw-normal">Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreRegs.map((reg) => (
                  <tr key={reg._id}>
                    <td>
                      {reg?.jobSeekerId?.personalInformation?.firstName
                        ? `${reg.jobSeekerId.personalInformation.firstName} ${
                            reg.jobSeekerId.personalInformation.lastName || ""
                          }`
                        : reg?.employerId?.companyInformation?.businessName ||
                          "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          reg.role === "jobseeker"
                            ? "bg-info"
                            : "bg-warning text-white"
                        }`}
                      >
                        {reg.role || "N/A"}
                      </span>
                    </td>
                    <td>{new Date(reg.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  const renderAttendanceTable = () => {
    const filteredAttendance = filterAttendance();

    return (
      <>
        {renderAttendanceSearch()}
        {loading.attendance ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="alert alert-info">
            No attendance records found matching your criteria
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th className="fw-normal">Job Seeker / Company</th>
                  <th className="fw-normal">Role</th>
                  <th className="fw-normal">Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => {
                  const user = record.user || record;
                  return (
                    <tr key={record._id}>
                      <td>
                        {user?.jobSeekerId?.personalInformation?.firstName
                          ? `${
                              user.jobSeekerId.personalInformation.firstName
                            } ${
                              user.jobSeekerId.personalInformation.lastName ||
                              ""
                            }`
                          : user?.employerId?.companyInformation
                              ?.businessName || "N/A"}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            user.role === "jobseeker"
                              ? "bg-info"
                              : "bg-warning text-white"
                          }`}
                        >
                          {user.role || "N/A"}
                        </span>
                      </td>
                      <td>{new Date(record.checkedInAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h1 className="h3 fw-bold">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            Job Fair Event Details
          </h1>
          <p className="text-muted mb-0">
            Track pre-registrations, attendance rates, and participant
            demographics
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-person-plus text-primary fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Pre-Registrations</h6>
                  <h3 className="mb-0">{stats.totalPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-people text-info fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Job Seekers</h6>
                  <h3 className="mb-0">{stats.jobSeekersPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-building text-success fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Employers</h6>
                  <h3 className="mb-0">{stats.employersPreRegs}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                  <i className="bi bi-calendar-check text-warning fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Attendance</h6>
                  <h3 className="mb-0">
                    {stats.totalAttendance}{" "}
                    <small className="text-muted fs-6">
                      ({stats.attendanceRate}%)
                    </small>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "preregs" ? "active" : ""}`}
            onClick={() => setActiveTab("preregs")}
          >
            Pre-Registrations
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        <div
          className={`tab-pane fade ${
            activeTab === "preregs" ? "show active" : ""
          }`}
        >
          {renderPreRegsTable()}
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "attendance" ? "show active" : ""
          }`}
        >
          {renderAttendanceTable()}
        </div>
      </div>
    </div>
  );
};

export default JobFairDetails;
