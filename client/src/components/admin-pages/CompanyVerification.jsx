import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown, Button } from "react-bootstrap";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const CompanyVerification = () => {
  const [status, setStatus] = useState("all"); // State to store the selected status
  const [companies, setCompanies] = useState([]);
  const [documents, setDocuments] = useState([]); // State to store the fetched documents
  const [filter, setFilter] = useState("all"); // State for selected filter
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // getAllCompanyDocuments();
    getAllCompanies();
  }, [filter]);

  const getAllCompanyDocuments = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-all-company-documents`,
        {
          params: { status: filter },
        }
      );
      console.log(res?.data?.documents);
      setDocuments(res?.data?.documents);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllCompanies = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-all-companies`,
        {
          params: {
            status: filter.status || undefined,
            isRenewal: filter.isRenewal,
          },
        }
      );
      console.log(res?.data?.stats);
      setCompanies(res?.data?.companies);
      setStats(res?.data?.stats);
    } catch (error) {
      console.log(error);
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

  // Dropdown content for action buttons
  const dropdownContent = (companyId) => (
    <Dropdown.Menu>
      <Dropdown.Item as="button" onClick={() => viewDetails(companyId)}>
        <i className="bi bi-info-circle"></i> Details
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const viewDetails = (companyId) => {
    navigate(`company-verification-details/${companyId}`);
  };

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;

    switch (selectedFilter) {
      case "renewal":
        setFilter({
          status: undefined,
          isRenewal: true,
        });
        break;
      case "all":
        setFilter({
          status: undefined,
          isRenewal: undefined,
        });
        break;
      default:
        setFilter({
          status: selectedFilter,
          isRenewal: undefined,
        });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company?.companyInformation?.businessName
        ?.toLowerCase()
        .includes(searchTerm) ||
      company?.companyInformation?.tinNumber
        ?.toLowerCase()
        .includes(searchTerm) ||
      company?.companyInformation?.employerName
        ?.toLowerCase()
        .includes(searchTerm);

    return matchesSearch;
  });

  const statsData = [
    {
      title: "All Companies",
      value: stats?.all || 0,
      icon: "bi bi-building-fill",
      bgColor: "bg-primary",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      icon: "bi bi-hourglass",
      bgColor: "bg-warning",
    },
    {
      title: "Accredited",
      value: stats?.accredited || 0,
      icon: "bi bi-file-earmark-check",
      bgColor: "bg-success",
    },
    {
      title: "Declined",
      value: stats?.declined || 0,
      icon: "bi bi-file-earmark-x",
      bgColor: "bg-danger",
    },
    {
      title: "Revoked",
      value: stats?.revoked || 0,
      icon: "bi bi-slash-circle",
      bgColor: "bg-secondary",
    },
  ];

  return (
    <div className="container">
      <h5 className="text-primary mb-3 mx-1">
        <i className="bi bi-building-fill-check"></i> Company Verification
      </h5>
      <section className="mb-3">
        <div className="row justify-content-center">
          <div>
            {/* Add gap utilities here - g-2 for small screens, g-md-3 for medium+ */}
            <div className="row g-2 g-md-3">
              {statsData.map((stat, index) => (
                <div key={index} className="col-lg col-md-4 col-6">
                  <div className="card border-0 shadow-sm h-100 bg-light">
                    <div className="card-body p-2 p-md-3">
                      <div className="d-flex align-items-center">
                        <div
                          className={`${stat.bgColor} rounded-3 p-1 p-md-2 me-2 me-md-3`}
                        >
                          <i
                            className={`${stat.icon} text-white fs-6 fs-md-5`}
                          ></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-0 mb-md-1 small text-uppercase">
                            {stat.title}
                          </h6>
                          <h5 className="card-title mb-0 fw-bold fs-6 fs-md-5">
                            {stat.value.toLocaleString()}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search UI */}
      <div className="d-flex justify-content-center mb-3">
        <div className="input-group" style={{ width: "100%" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Find by ( company or business name) "
            style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="btn btn-primary text-light" type="submit">
            <i className="bi bi-search"></i> Search
          </button>
        </div>
      </div>

      {/* Filters UI */}
      <div className="d-flex justify-content-start gap-3 mb-2">
        <div className="d-flex align-items-center gap-2">
          <div>
            <select
              id="filter"
              className="form-select"
              value={filter.status || (filter.isRenewal ? "renewal" : "all")}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accredited">Accredited</option>
              <option value="declined">Declined</option>
              <option value="revoked">Revoked</option>
              <option value="renewal">Renewal</option>
            </select>
          </div>
        </div>

        <button className="btn btn-light">
          <i className="bi bi-arrow-counterclockwise"></i> Renewals{" "}
          <span className="badge bg-primary">{stats?.renewal}</span>
        </button>
      </div>

      {/* Table Container with Scrollable Body */}
      <div style={{ maxHeight: "380px", overflow: "auto" }}>
        <div style={{ minWidth: "800px" }}>
          {" "}
          {/* Set minimum width to ensure horizontal scroll */}
          <table
            className="table table-hover table-striped mt-2"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            {/* Table Header */}
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
                  style={{ width: "20%" }}
                >
                  <i className="bi bi-building-fill"></i> Company
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle"
                  style={{ width: "15%" }}
                >
                  <i className="bi bi-9-square-fill"></i> Tin No.
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle text-center"
                  style={{ width: "15%" }}
                >
                  <i className="bi bi-calendar-event-fill"></i> Date
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle text-center"
                  style={{ width: "10%" }}
                >
                  <i className="bi bi-arrow-counterclockwise"></i> Renewal
                </th>
                <th
                  scope="col"
                  className="small text-muted align-middle text-center"
                  style={{ width: "15%" }}
                >
                  <i className="bi bi-question-square-fill"></i> Status
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

            {/* Table Body */}
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company._id}>
                    <td
                      scope="row"
                      className="small text-muted align-middle"
                      style={{ width: "20%" }}
                    >
                      {company?.companyInformation?.companyLogo && (
                        <img
                          src={company?.companyInformation?.companyLogo}
                          alt={
                            company?.companyInformation?.companyLogo ||
                            "Company Logo"
                          }
                          className="me-2 border shadow-sm"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      )}
                      {`${company?.companyInformation?.businessName}`}
                    </td>
                    <td
                      scope="row"
                      className="small text-muted align-middle"
                      style={{ width: "15%" }}
                    >
                      {`${company?.companyInformation?.tinNumber}`}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      {new Date(company?.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "10%" }}
                    >
                      {company?.isRenewal ? "True" : "False"}
                    </td>
                    <td
                      className="small text-muted align-middle text-center"
                      style={{ width: "15%" }}
                    >
                      <span
                        className={`text-white badge ${getStatusBadgeClass(
                          company?.status
                        )}`}
                      >
                        {company?.status}
                      </span>
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
                        {dropdownContent(company._id)}
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyVerification;
