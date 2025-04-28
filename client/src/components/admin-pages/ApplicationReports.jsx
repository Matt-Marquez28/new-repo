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
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
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
} from "react-icons/fi";
import { FaRegFileExcel } from "react-icons/fa";

const ApplicationReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessNames, setBusinessNames] = useState([]);
  const [filters, setFilters] = useState({
    year: null,
    month: null,
    status: "",
    businessName: "",
    hasDisability: "",
    isSeniorCitizen: "", // Add this line
  });
  const [summary, setSummary] = useState({
    total: 0,
    statuses: {},
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch business names and initial reports
  useEffect(() => {
    const fetchBusinessNames = async () => {
      try {
        const response = await fetch(
          `${APPLICATION_API_END_POINT}/get-business-names`
        );
        const data = await response.json();
        if (response.ok) {
          setBusinessNames(data);
        }
      } catch (err) {
        console.error("Failed to fetch business names:", err);
      }
    };

    fetchBusinessNames();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const getSingleReport = async (id) => {
    console.log(`EXPORTING ID => ${id}`);
    try {
      const response = await axios.get(
        `${JOBSEEKER_API_END_POINT}/export-single-jobseeker-data/${id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "jobseeker_export.xlsx");
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
      if (filters.hasDisability !== "")
        params.append("hasDisability", filters.hasDisability); // Add this line
      // In your fetchReports function, make sure the params are properly set:
      // In your fetchReports function
      if (filters.isSeniorCitizen !== "") {
        params.append("isSeniorCitizen", filters.isSeniorCitizen);
      }

      const response = await fetch(
        `${APPLICATION_API_END_POINT}/get-all-application-reports?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setReports(data.applications);
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
      hasDisability: "",
      isSeniorCitizen: "", // Add this line
    });
    setSearchTerm("");
  };

  const handleExportCSV = () => {
    const headers = [
      "Applicant ID",
      "Applicant Name",
      "Email",
      "Phone",
      "Job Title",
      "Department",
      "Company",
      "Industry",
      "Status",
      "Applied Date",
      "Last Updated",
      "Hired Date",
      "Hired By",
      "Remarks",
    ];

    const formatDateForCSV = (dateValue) => {
      if (!dateValue) return "";

      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return `\t${date.toISOString().split("T")[0]}`;
      } catch (e) {
        console.error("Error formatting date:", e);
        return "";
      }
    };

    const data = reports.map((report) => [
      report.applicant.id,
      report.applicant.name,
      report.applicant.email,
      report.applicant.phone,
      report.job.title,
      report.job.department,
      report.company.businessName,
      report.company.industry,
      report.application.status,
      formatDateForCSV(report.application.appliedDate),
      formatDateForCSV(report.application.lastUpdated),
      formatDateForCSV(report.application.hiredDate),
      report.application.hiredBy,
      report.remarks || "",
    ]);

    downloadCSV({
      filename: `applications-report-${
        new Date().toISOString().split("T")[0]
      }.csv`,
      headers,
      data,
    });
  };

  const handleViewApplicant = (applicantId) => {
    navigate(`/jobseekers/${applicantId}`);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "interview scheduled", label: "Interview Scheduled" },
    { value: "interview completed", label: "Interview Completed" },
    { value: "hired", label: "Hired" },
    { value: "declined", label: "Declined" },
  ];

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      report.applicant?.name?.toLowerCase().includes(searchLower) ||
      report.applicant?.email?.toLowerCase().includes(searchLower) ||
      report.applicant?.phone?.toLowerCase().includes(searchLower) ||
      report.job?.title?.toLowerCase().includes(searchLower) ||
      report.company?.businessName?.toLowerCase().includes(searchLower) ||
      report.application?.status?.toLowerCase().includes(searchLower)
    );
  });

  function getStatusIcon(status) {
    const color = getStatusBadgeColor(status);
    const props = { size: 20, className: `text-${color}` };

    switch (status) {
      case "hired":
        return <FiBriefcase {...props} />;
      case "pending":
        return <FiFileText {...props} />;
      case "interview scheduled":
        return <FiCalendar {...props} />;
      case "interview completed":
        return <FiFileText {...props} />;
      case "declined":
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
              Application Reports
            </h4>
          </div>
          <p className="text-muted mb-0 mt-1">
            Manage all upcoming and past job fair events
          </p>
        </div>
        {/* button */}
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
              filters.hasDisability === "" &&
              filters.isSeniorCitizen === "" && // Add this line
              !searchTerm
            }
            className="text-danger p-0"
          >
            Reset All
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
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

            <Col md={3}>
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

            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  Senior Citizen
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiUser size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.isSeniorCitizen}
                    onChange={(e) =>
                      handleFilterChange("isSeniorCitizen", e.target.value)
                    }
                    className="border-start-0"
                  >
                    <option value="">All Applicants</option>
                    <option value="true">Senior Citizen (60+)</option>
                    <option value="false">Not Senior Citizen</option>
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={3}>
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

            <Col md={3}>
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

            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted">
                  Disability Status
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text
                    className="text-white"
                    style={{ backgroundColor: "#1a4798" }}
                  >
                    <FiUser size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    as="select"
                    value={filters.hasDisability}
                    onChange={(e) =>
                      handleFilterChange("hasDisability", e.target.value)
                    }
                    className="border-start-0"
                  >
                    <option value="">All Applicants</option>
                    <option value="true">With Disability</option>
                    <option value="false">Without Disability</option>
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="small text-muted">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search applicants, jobs, companies..."
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
                  <FiUser size={20} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 text-muted small">Total Applications</h6>
                  <h5 className="mb-0 fw-bold">{summary.total}</h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {Object.entries(summary.statuses).map(([status, count]) => (
          <Col xl={2} md={4} sm={6} key={status}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center">
                  <div
                    className={`bg-${getStatusBadgeColor(
                      status
                    )} bg-opacity-10 p-2 rounded me-3`}
                  >
                    {getStatusIcon(status)}
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
          <h5 className="mb-0">Application Details</h5>
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
              No applications found matching your filters.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 fw-normal">Applicant</th>
                    <th className="border-0 fw-normal">Job Details</th>
                    <th className="border-0 fw-normal">Company</th>
                    <th className="border-0 fw-normal">Status</th>
                    <th className="border-0 fw-normal">Applied Date</th>
                    <th className="border-0 text-center fw-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr key={index} className="border-top">
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <FiUser size={20} className="text-primary" />
                          </div>
                          <div>
                            <strong className="text-primary fw-semibold">
                              {report.applicant.name}
                            </strong>
                            <div className="text-muted small">
                              ID: {report.applicant.id}
                            </div>
                            <div className="text-muted small">
                              {report.applicant.email}
                            </div>
                            <div className="text-muted small">
                              {report.applicant.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-info bg-opacity-10 p-2 rounded me-3">
                            <FiBriefcase size={20} className="text-info" />
                          </div>
                          <div>
                            <h6 className="fw-semibold">{report.job.title}</h6>
                            <div className="text-muted small">
                              {report.job.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                            <FiHome size={20} className="text-warning" />
                          </div>
                          <div>
                            <h6 className="fw-semibold">
                              {report.company.businessName}
                            </h6>
                            <div className="text-muted small">
                              {report.company.industry}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <Badge
                          bg={getStatusBadgeColor(report.application.status)}
                          className=""
                        >
                          {report.application.status}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <div className="text-nowrap">
                          {new Date(
                            report.application.appliedDate
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
                                handleViewApplicant(report.applicant.id)
                              }
                            >
                              <FiEye className="me-2" /> View Details
                            </Dropdown.Item> */}
                            <Dropdown.Item
                              onClick={() =>
                                getSingleReport(report.applicant.id)
                              }
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

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "interview scheduled":
      return "info";
    case "interview completed":
      return "primary";
    case "hired":
      return "success";
    case "declined":
      return "danger";
    default:
      return "secondary";
  }
};

export default ApplicationReports;
