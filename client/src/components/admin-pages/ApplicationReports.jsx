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
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";

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
  });
  const [summary, setSummary] = useState({
    total: 0,
    statuses: {},
  });
  const navigate = useNavigate();

  // Fetch business names and initial reports
  useEffect(() => {
    // Fetch business names only once when component mounts
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
          responseType: "blob", // Required for binary (Excel) downloads
          withCredentials: true, // Ensures cookies/auth headers are sent
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "jobseeker_export.xlsx");
      document.body.appendChild(link);
      link.click();

      // Cleanup
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
    });
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

        // Add TAB character to force Excel to treat as text
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
      filename: "applications-report.csv",
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

  return (
    <div className="container">
      <h1 className="mb-4">Application Reports</h1>

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
              !filters.businessName
            }
          >
            Reset Filters
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
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

            <Col md={3}>
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

            <Col md={3}>
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

            <Col md={3}>
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
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary">
            <Card.Body>
              <h5 className="card-title">Total Applications</h5>
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

      {/* Reports Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Application Details</h5>
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
              No applications found matching your filters.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Details</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{report.applicant.name}</strong>
                        <br />
                        ID: {report.applicant.id}
                        <br />
                        {report.applicant.email}
                        <br />
                        {report.applicant.phone}
                      </td>
                      <td>
                        <strong>{report.job.title}</strong>
                        <br />
                        {report.job.department}
                      </td>
                      <td>
                        <strong>{report.company.businessName}</strong>
                        <br />
                        {report.company.industry}
                      </td>
                      <td>
                        <Badge
                          bg={getStatusBadgeColor(report.application.status)}
                        >
                          {report.application.status}
                        </Badge>
                      </td>
                      <td>
                        {new Date(
                          report.application.appliedDate
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            handleViewApplicant(report.applicant.id)
                          }
                          className="me-2"
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => getSingleReport(report.applicant.id)}
                          className="me-2"
                        >
                          <i className="fas fa-eye me-1"></i> Export
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
