import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Badge,
} from "react-bootstrap";
import { downloadCSV } from "../../utils/csvDownloader";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CompanyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessNames, setBusinessNames] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [filters, setFilters] = useState({
    year: null,
    month: null,
    status: "",
    businessName: "",
    industry: "",
    companySize: "",
  });
  const [summary, setSummary] = useState({
    total: 0,
    statuses: {},
    topIndustries: [],
    companySizes: {},
  });
  const navigate = useNavigate();

  // Fetch business names and industries for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [businessResponse, industriesResponse] = await Promise.all([
          fetch(`${COMPANY_API_END_POINT}/get-business-names`),
          fetch(`${COMPANY_API_END_POINT}/get-industries`),
        ]);

        const businessData = await businessResponse.json();
        const industriesData = await industriesResponse.json();

        if (businessResponse.ok) setBusinessNames(businessData);
        if (industriesResponse.ok) setIndustries(industriesData);
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const getSingleReport = async (id) => {
    try {
      const response = await axios.get(
        `${COMPANY_API_END_POINT}/export-single-company-data/${id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "company_export.xlsx");
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.month) params.append("month", filters.month);
      if (filters.status) params.append("status", filters.status);
      if (filters.businessName)
        params.append("businessName", filters.businessName);
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.companySize)
        params.append("companySize", filters.companySize);

      const response = await fetch(
        `${COMPANY_API_END_POINT}/get-all-company-reports?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setReports(data.companies);
        setSummary(data.summary);
      } else {
        throw new Error(data.message || "Failed to fetch reports");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      year: null,
      month: null,
      status: "",
      businessName: "",
      industry: "",
      companySize: "",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Company ID",
      "Business Name",
      "TIN Number",
      "Industry",
      "Company Size",
      "Type of Business",
      "Status",
      "Accreditation ID",
      "Accreditation Type",
      "Accreditation Date",
      "Is Renewal",
      "Employer Name",
      "Employer Position",
      "Address",
      "Contact Person",
      "Mobile Number",
      "Telephone",
      "Email",
      "Facebook",
      "Instagram",
      "Twitter",
      "Website",
      "Job Vacancies",
      "Registered Date",
      "Last Updated",
      "Remarks",
      "Account Email",
      "Account Username",
      "Account Status",
    ];

    const data = reports.map((report) => [
      report.companyId,
      report.businessInfo.businessName,
      report.businessInfo.tinNumber,
      report.businessInfo.industry,
      report.businessInfo.companySize,
      report.businessInfo.typeOfBusiness,
      report.accreditation.status,
      report.accreditation.accreditationId,
      report.accreditation.accreditationType,
      report.accreditation.accreditationDate,
      report.accreditation.isRenewal,
      report.contactInfo.employerName,
      report.contactInfo.employerPosition,
      `${report.contactInfo.address.unitNumber || ""} ${
        report.contactInfo.address.street || ""
      }, ${report.contactInfo.address.barangay || ""}, ${
        report.contactInfo.address.cityMunicipality || ""
      }, ${report.contactInfo.address.province || ""} ${
        report.contactInfo.address.zipCode || ""
      }`,
      report.contactInfo.contactPerson,
      report.contactInfo.mobileNumber,
      report.contactInfo.telephoneNumber,
      report.contactInfo.email,
      report.socialMedia.facebook || "",
      report.socialMedia.instagram || "",
      report.socialMedia.twitter || "",
      report.socialMedia.website || "",
      report.vacancies,
      report.registeredDate,
      report.lastUpdated,
      report.remarks || "",
      report.accountInfo.email,
      report.accountInfo.username,
      report.accountInfo.isActive ? "Active" : "Inactive",
    ]);

    downloadCSV({
      filename: "companies-report.csv",
      headers,
      data,
    });
  };

  const handleViewCompany = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
  ];

  const companySizeOptions = [
    { value: "", label: "All Sizes" },
    { value: "small", label: "Small (1-50 employees)" },
    { value: "medium", label: "Medium (51-200 employees)" },
    { value: "large", label: "Large (201+ employees)" },
  ];

  return (
    <div className="container">
      <h1 className="mb-4">Company Reports</h1>

      {/* Filters Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Filters</h5>
          <Button
            variant="light"
            size="sm"
            onClick={handleResetFilters}
            disabled={
              !filters.year &&
              !filters.month &&
              !filters.status &&
              !filters.businessName &&
              !filters.industry &&
              !filters.companySize
            }
          >
            Reset Filters
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.year || ""}
                  onChange={(e) =>
                    handleFilterChange("year", e.target.value || null)
                  }
                >
                  <option value="">All Years</option>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.month || ""}
                  onChange={(e) =>
                    handleFilterChange("month", e.target.value || null)
                  }
                  disabled={!filters.year}
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = new Date(2000, i).toLocaleString("default", {
                      month: "long",
                    });
                    return (
                      <option key={i + 1} value={i + 1}>
                        {month}
                      </option>
                    );
                  })}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            {/* <Col md={2}>
              <Form.Group>
                <Form.Label>Company</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.businessName}
                  onChange={(e) =>
                    handleFilterChange("businessName", e.target.value)
                  }
                >
                  <option value="">All Companies</option>
                  {businessNames.map((company) => (
                    <option key={company._id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Industry</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.industry}
                  onChange={(e) => handleFilterChange("industry", e.target.value)}
                >
                  <option value="">All Industries</option>
                  {industries.map((industry, index) => (
                    <option key={index} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Company Size</Form.Label>
                <Form.Control
                  as="select"
                  value={filters.companySize}
                  onChange={(e) => handleFilterChange("companySize", e.target.value)}
                >
                  {companySizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col> */}
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary">
            <Card.Body>
              <h5 className="card-title">Total Companies</h5>
              <h2 className="mb-0">{summary.total}</h2>
            </Card.Body>
          </Card>
        </Col>

        {Object.entries(summary.statuses).map(([status, count]) => (
          <Col md={2} key={status}>
            <Card className={`text-white bg-${getStatusBadgeColor(status)}`}>
              <Card.Body>
                <h5 className="card-title text-capitalize">{status}</h5>
                <h4 className="mb-0">{count}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Industry Distribution */}
      {summary.topIndustries.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5>Top Industries</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {summary.topIndustries.map((industry, index) => (
                    <Col md={2} key={index}>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <h4 className="mb-0">{industry.count}</h4>
                        </div>
                        <div>
                          <small className="text-muted">
                            {industry._id || "Unknown"}
                          </small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Company Size Distribution */}
      {/* {Object.keys(summary.companySizes).length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5>Company Size Distribution</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(summary.companySizes).map(([size, count]) => (
                    <Col md={2} key={size}>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <h4 className="mb-0">{count}</h4>
                        </div>
                        <div>
                          <small className="text-muted">
                            {size === "small"
                              ? "Small"
                              : size === "medium"
                              ? "Medium"
                              : size === "large"
                              ? "Large"
                              : size}
                          </small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )} */}

      {/* Reports Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Company Details</h5>
          <div>
            <Button
              variant="success"
              size="sm"
              onClick={handleExportCSV}
              disabled={reports.length === 0}
              className="me-2"
            >
              <i className="fas fa-download me-2"></i>Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={fetchReports}>
              <i className="fas fa-sync me-2"></i>Refresh
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <Alert variant="info">
              No companies found matching your filters.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Business Info</th>
                    <th>Contact Info</th>
                    <th>Accreditation</th>
                    <th>Account</th>
                    <th>Vacancies</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{report.businessInfo.businessName}</strong>
                        <br />
                        <small className="text-muted">
                          TIN: {report.businessInfo.tinNumber}
                        </small>
                        <br />
                        <Badge bg="info">
                          {report.businessInfo.industry}
                        </Badge>{" "}
                        <Badge bg="secondary">
                          {report.businessInfo.companySize}
                        </Badge>
                      </td>
                      <td>
                        <strong>{report.contactInfo.employerName}</strong>
                        <br />
                        {report.contactInfo.employerPosition}
                        <br />
                        {report.contactInfo.contactPerson}
                        <br />
                        {report.contactInfo.mobileNumber}
                        <br />
                        {report.contactInfo.email}
                      </td>
                      <td>
                        <Badge
                          bg={getStatusBadgeColor(report.accreditation.status)}
                        >
                          {report.accreditation.status}
                        </Badge>
                        <br />
                        {report.accreditation.accreditationType}
                        <br />
                        {report.accreditation.accreditationDate}
                        <br />
                        {report.accreditation.isRenewal ? "Renewal" : "New"}
                      </td>
                      <td>
                        {report.accountInfo.email}
                        <br />
                        <Badge
                          bg={
                            report.accountInfo.isActive ? "success" : "danger"
                          }
                        >
                          {report.accountInfo.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <h4>{report.vacancies}</h4>
                      </td>
                      <td>
                        {report.registeredDate}
                        <br />
                        <small>Last updated: {report.lastUpdated}</small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewCompany(report.companyId)}
                          className="me-2 mb-2"
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => getSingleReport(report.companyId)}
                        >
                          <i className="fas fa-file-export me-1"></i> Export
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Helper function to determine badge color based on status
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "suspended":
      return "secondary";
    default:
      return "primary";
  }
};

export default CompanyReports;
