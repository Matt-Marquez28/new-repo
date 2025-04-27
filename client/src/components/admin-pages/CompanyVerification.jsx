import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const CompanyVerification = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRenewalFilter, setIsRenewalFilter] = useState(false);

  useEffect(() => {
    getAllCompanies();
  }, [statusFilter, isRenewalFilter]);

  const getAllCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-all-companies`,
        {
          params: {
            status: statusFilter === "all" ? undefined : statusFilter,
            isRenewal: isRenewalFilter || undefined,
          },
        }
      );
      setCompanies(res?.data?.companies);
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
      case "accredited":
        return "bg-success text-white";
      case "declined":
        return "bg-danger text-white";
      case "revoked":
        return "bg-secondary text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const viewDetails = (companyId) => {
    navigate(`company-verification-details/${companyId}`);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company?.companyInformation?.businessName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company?.companyInformation?.tinNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company?.companyInformation?.employerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const statsData = [
    {
      title: "All Companies",
      value: stats?.all || 0,
      icon: "bi-building-fill",
      color: "primary",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: "bi-hourglass-top",
      color: "warning",
    },
    {
      title: "Accredited",
      value: stats?.accredited || 0,
      icon: "bi-file-earmark-check-fill",
      color: "success",
    },
    {
      title: "Declined",
      value: stats?.declined || 0,
      icon: "bi-file-earmark-x-fill",
      color: "danger",
    },
    {
      title: "Revoked",
      value: stats?.revoked || 0,
      icon: "bi bi-slash-circle-fill",
      color: "secondary",
    },
    {
      title: "Renewals",
      value: stats?.renewal || 0,
      icon: "bi-arrow-repeat",
      color: "info",
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
              <i className="bi bi-building-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Company Verification
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Verify company credentials and manage approval status
          </p>
        </div>
      </div>

      {/* Stats Cards - Horizontal Layout for Desktop */}
      <div className="row g-3 mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col-md-2 col-6">
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
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search companies..."
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
                <option value="pending">Pending</option>
                <option value="accredited">Accredited</option>
                <option value="declined">Declined</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            <div className="col-md-3">
              <button
                className={`btn w-100 ${
                  isRenewalFilter ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setIsRenewalFilter(!isRenewalFilter)}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                {isRenewalFilter ? "Showing Renewals" : "Show Renewals"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building-x text-muted fs-1"></i>
              <h5 className="mt-3">No companies found</h5>
              <p className="text-muted">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }} className="fw-normal">
                      Company Details
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      TIN Number
                    </th>
                    <th style={{ width: "15%" }} className="fw-normal">
                      Registration Date
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Renewal
                    </th>
                    <th style={{ width: "10%" }} className="fw-normal">
                      Status
                    </th>
                    <th
                      style={{ width: "15%" }}
                      className="fw-normal text-center"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {company?.companyInformation?.companyLogo && (
                            <img
                              src={company.companyInformation.companyLogo}
                              alt="Company Logo"
                              className="rounded me-3 shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div>
                            <h6 className="mb-1 text-primary fw-semibold">
                              {company?.companyInformation?.businessName ||
                                "N/A"}
                            </h6>
                            <p className="text-muted small mb-0">
                              {company?.companyInformation?.employerName ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {company?.companyInformation?.tinNumber
                            ? company.companyInformation.tinNumber.replace(
                                /(\d{3})(\d{3})(\d{3})(\d{3})/,
                                "$1-$2-$3-$4"
                              )
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {new Date(company.createdAt).toLocaleDateString(
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
                        <span
                          className={`badge rounded-pill ${
                            company.isRenewal
                              ? "bg-primary text-white"
                              : "bg-secondary text-white"
                          }`}
                        >
                          {company.isRenewal ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            company.status
                          )}`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary "
                          onClick={() => viewDetails(company._id)}
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

export default CompanyVerification;
