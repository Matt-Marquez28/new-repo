import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const JobVacancyVerification = () => {
  const navigate = useNavigate();
  const [jobVacancies, setJobVacancies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getAllJobVacancies();
  }, [statusFilter]);

  const getAllJobVacancies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-all-job-vacancies-admin`,
        {
          params: {
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        }
      );
      setJobVacancies(res?.data?.jobVacancies);
      setStats(res?.data?.stats);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "approved":
        return "bg-success text-white";
      case "declined":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const viewDetails = (jobVacancyId) => {
    navigate(`job-vacancy-verification-details/${jobVacancyId}`);
  };

  const filteredJobVacancies = jobVacancies.filter((jobVacancy) => {
    const company = jobVacancy?.companyId?.companyInformation || {};
    const matchesSearch =
      jobVacancy?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const statsData = [
    {
      title: "All Jobs",
      value: stats?.all || 0,
      icon: "bi-suitcase-lg-fill",
      color: "primary",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: "bi-hourglass-top",
      color: "warning",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      icon: "bi-file-earmark-check-fill",
      color: "success",
    },
    {
      title: "Declined",
      value: stats?.declined || 0,
      icon: "bi-file-earmark-x-fill",
      color: "danger",
    },
  ];

  return (
    <div className="container">
      {/* Page Header */}
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
              <i className="bi bi-suitcase-lg-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Job Vacancy Verification
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Verify job vacancies and manage approval status
          </p>
        </div>
      </div>

      {/* Stats Cards - Horizontal Layout for Desktop */}
      <div className="row g-3 mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col-md-3 col-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div
                    className={`bg-${stat.color} bg-opacity-10 p-2 rounded me-3`}
                  >
                    <i
                      className={`bi ${stat.icon} text-${stat.color} fs-5`}
                    ></i>
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted small">{stat.title}</h6>
                    <h5 className="mb-0 fw-bold">{stat.value}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search job vacancies by title or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Vacancies Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading job vacancies...</p>
            </div>
          ) : filteredJobVacancies.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-briefcase text-muted fs-1"></i>
              <h5 className="mt-3">No job vacancies found</h5>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }} className="fw-normal">
                      Job Title
                    </th>
                    <th style={{ width: "20%" }} className="fw-normal">
                      Company
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      Date Posted
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Vacancies
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Status
                    </th>
                    <th
                      style={{ width: "20%" }}
                      className="fw-normal text-center"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobVacancies.map((jobVacancy) => (
                    <tr key={jobVacancy._id}>
                      <td>
                        <h6 className="mb-1 text-primary fw-semibold">
                          {jobVacancy?.jobTitle || "N/A"}
                        </h6>
                        <p className="text-muted small mb-0">
                          {jobVacancy.description?.substring(0, 60) ||
                            "No description"}
                          ...
                        </p>
                      </td>
                      <td>
                        <span className="">
                          {jobVacancy?.companyId?.companyInformation
                            ?.businessName || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {new Date(jobVacancy.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {jobVacancy?.vacancies || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge text-white ${getStatusBadgeClass(
                            jobVacancy.publicationStatus
                          )}`}
                        >
                          {jobVacancy.publicationStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewDetails(jobVacancy._id)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobVacancyVerification;
