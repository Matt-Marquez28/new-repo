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
  Dropdown,
  InputGroup,
} from "react-bootstrap";
import { downloadCSV } from "../../utils/csvDownloader";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiHome,
  FiFileText,
  FiLayers,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import { FaRegFileExcel } from "react-icons/fa";

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
  const [searchTerm, setSearchTerm] = useState("");
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
    setSearchTerm("");
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
      filename: `companies-report-${
        new Date().toISOString().split("T")[0]
      }.csv`,
      headers,
      data,
    });
  };

  const handleViewCompany = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "incomplete", label: "Incomplete" },
    { value: "accredited", label: "Accredited" },
    { value: "declined", label: "Declined" },
    { value: "Revoked", label: "Revoked" },
  ];

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      report.businessInfo?.businessName?.toLowerCase().includes(searchLower) ||
      report.contactInfo?.employerName?.toLowerCase().includes(searchLower) ||
      report.contactInfo?.email?.toLowerCase().includes(searchLower) ||
      report.businessInfo?.industry?.toLowerCase().includes(searchLower) ||
      report.accreditation?.status?.toLowerCase().includes(searchLower)
    );
  });

  function getCompanyStatusIcon(status) {
    const color = getStatusBadgeColor(status);
    const props = { size: 20, className: `text-${color}` };

    switch (status) {
      case "accredited":
        return <FiAward {...props} />;
      case "incomplete":
        return <FiFileText {...props} />;
      case "declined":
        return <FiFileText {...props} />;
      case "revoked":
        return <FiFileText {...props} />;
      default:
        return <FiFileText {...props} />;
    }
  }

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-1">
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
              <i className="bi bi-file-earmark-text-fill text-white"></i>
            </div>
            <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Company Reports
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Manage all registered companies and their accreditation status
          </p>
        </div>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchReports}
            className="me-2"
          >
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleExportCSV}
            disabled={reports.length === 0}
          >
            <FiDownload className="me-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0 d-flex align-items-center">
            <FiFilter className="me-2" /> Filters
          </h5>
          <Button
            variant="link"
            size="sm"
            onClick={handleResetFilters}
            disabled={
              !filters.year &&
              !filters.month &&
              !filters.status &&
              !filters.businessName &&
              !filters.industry &&
              !filters.companySize &&
              !searchTerm
            }
            className="text-danger p-0"
          >
            Reset All
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Year</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiCalendar size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.year || ""}
                    onChange={(e) =>
                      handleFilterChange("year", e.target.value || null)
                    }
                    className="border-start-0"
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
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Month</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiCalendar size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.month || ""}
                    onChange={(e) =>
                      handleFilterChange("month", e.target.value || null)
                    }
                    disabled={!filters.year}
                    className="border-start-0"
                  >
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = new Date(2000, i).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      );
                      return (
                        <option key={i + 1} value={i + 1}>
                          {month}
                        </option>
                      );
                    })}
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small text-muted">Status</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiFileText size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="border-start-0"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* <Col md={2}>
              <Form.Group>
                <Form.Label className="small text-muted">Company</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiHome size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.businessName}
                    onChange={(e) =>
                      handleFilterChange("businessName", e.target.value)
                    }
                    className="border-start-0"
                  >
                    <option value="">All Companies</option>
                    {businessNames.map((company) => (
                      <option key={company._id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="small text-muted">Industry</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiLayers size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.industry}
                    onChange={(e) =>
                      handleFilterChange("industry", e.target.value)
                    }
                    className="border-start-0"
                  >
                    <option value="">All Industries</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="small text-muted">Size</Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiUsers size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.companySize}
                    onChange={(e) =>
                      handleFilterChange("companySize", e.target.value)
                    }
                    className="border-start-0"
                  >
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col> */}

            <Col md={12}>
              <Form.Group>
                <Form.Label className="small text-muted">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search companies, employers, industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xl={3} md={6} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                  <FiHome size={20} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted small">Total Companies</h6>
                  <h5 className="mb-0 fw-bold">{summary.total}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {Object.entries(summary.statuses).map(([status, count]) => (
          <Col xl={2} md={4} sm={6} key={status}>
            <Card
              className={`border-0 border-start-${getStatusBadgeColor(
                status
              )} shadow-sm h-100`}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div
                    className={`bg-${getStatusBadgeColor(
                      status
                    )} bg-opacity-10 p-2 rounded me-3`}
                  >
                    {getCompanyStatusIcon(status)}
                  </div>
                  <div>
                    <h6 className="mb-0 text-muted small">{status}</h6>
                    <h5 className="mb-0 fw-bold">{count}</h5>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Reports Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 className="mb-0">Company Details</h5>
          <div className="d-flex align-items-center">
            <span className="text-muted small me-3">
              Showing {filteredReports.length} of {reports.length} records
            </span>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-4">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-muted">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <Alert variant="info" className="m-4">
              No companies found matching your filters.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 fw-normal">Company</th>
                    <th className="border-0 fw-normal">Contact</th>
                    <th className="border-0 fw-normal">Accreditation</th>
                    {/* <th className="border-0 fw-normal">Account</th> */}
                    {/* <th className="border-0 fw-normal">Vacancies</th> */}
                    <th className="border-0 fw-normal">Registered</th>
                    <th className="border-0 text-center fw-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr key={index} className="border-top">
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <FiHome size={20} className="text-primary" />
                          </div>
                          <div>
                            <strong className="text-primary fw-semibold">
                              {report.businessInfo.businessName}
                            </strong>
                            <div className="text-muted small">
                              TIN: {report.businessInfo.tinNumber}
                            </div>
                            <div className="d-flex mt-1">
                              <Badge bg="info" className="me-1 text-capitalize">
                                {report.businessInfo.industry}
                              </Badge>
                              <Badge bg="secondary" className="text-capitalize">
                                {report.businessInfo.companySize}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                            <FiUser size={20} className="text-warning" />
                          </div>
                          <div>
                            <h6 className="fw-semibold">
                              {report.contactInfo.employerName}
                            </h6>
                            <div className="text-muted small">
                              {report.contactInfo.employerPosition}
                            </div>
                            <div className="text-muted small">
                              {report.contactInfo.contactPerson}
                            </div>
                            <div className="text-muted small">
                              {report.contactInfo.mobileNumber}
                            </div>
                            <div className="text-muted small">
                              {report.contactInfo.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                            <FiAward size={20} className="text-success" />
                          </div>
                          <div>
                            <Badge
                              bg={getStatusBadgeColor(
                                report.accreditation.status
                              )}
                              className="mb-1 text-capitalize"
                            >
                              {report.accreditation.status}
                            </Badge>
                            {/* <div className="text-muted small">
                              {report.accreditation.accreditationType}
                            </div> */}
                            <div className="text-muted small">
                              {report.accreditation.accreditationDate}
                            </div>
                            <div className="text-muted small">
                              {report.accreditation.isRenewal
                                ? "Renewal"
                                : "New"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="align-middle">
                        <div className="text-nowrap">
                          {new Date(report.registeredDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-muted small">
                          Last updated:{" "}
                          {new Date(report.lastUpdated).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="text-end align-middle">
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            id="dropdown-actions"
                            className="px-3"
                          >
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {/* <Dropdown.Item
                              onClick={() =>
                                handleViewCompany(report.companyId)
                              }
                            >
                              <FiEye className="me-2" /> View Details
                            </Dropdown.Item> */}
                            <Dropdown.Item
                              onClick={() => getSingleReport(report.companyId)}
                            >
                              <FaRegFileExcel className="me-2" /> Export to
                              Excel
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
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
    case "accredited":
      return "success";
    case "declined":
      return "danger";
    case "revoked":
      return "secondary";
    default:
      return "primary";
  }
};

export default CompanyReports;
