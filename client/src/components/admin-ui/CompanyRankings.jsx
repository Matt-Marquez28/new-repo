import React, { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Table, Pagination, Form, Spinner, Alert } from "react-bootstrap";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompanyRankings = () => {
  const [rankings, setRankings] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCompanyRankings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${COMPANY_API_END_POINT}/get-company-rankings`
        );

        setRankings(response.data.rankings);
        setBarChartData(response.data.barChartData);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch company rankings"
        );
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyRankings();
  }, []);

  // Filter and paginate data
  const filteredRankings = useMemo(() => {
    return rankings.filter((company) =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankings, searchTerm]);

  const paginatedRankings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRankings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRankings, currentPage, itemsPerPage]);

  // Optimize chart data to show only top 15 companies
  const optimizedChartData = useMemo(() => {
    if (!barChartData) return null;

    return {
      ...barChartData,
      labels: barChartData.labels.slice(0, 15),
      datasets: barChartData.datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
        hoverBackgroundColor: "#0056b3",
        hoverBorderColor: "#003d7a",
        data: dataset.data.slice(0, 15),
      })),
    };
  }, [barChartData]);

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading rankings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mx-3">
        <Alert.Heading>Error Loading Data</Alert.Heading>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-danger"
          >
            Retry
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm border rounded">
        <div className="card-body">
          <h4 className="card-title mb-4">Top Companies Ranking</h4>

          {/* Search Input */}
          <div className="mb-4">
            <Form.Control
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-100 w-md-50"
            />
          </div>

          {/* Bar Chart - Showing only top 15 */}
          {optimizedChartData && (
            <div className="mb-5" style={{ height: "400px" }}>
              <Bar
                data={optimizedChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        font: {
                          size: 14,
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor: "#2c3e50",
                      titleFont: {
                        size: 14,
                        weight: "bold",
                      },
                      bodyFont: {
                        size: 12,
                      },
                      callbacks: {
                        label: (context) => {
                          return `${context.dataset.label}: ${context.raw}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        maxRotation: 45,
                        minRotation: 30,
                        font: {
                          size: 12,
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                  },
                }}
              />
              {barChartData?.labels?.length > 15 && (
                <p className="text-muted small mt-2 text-center">
                  Showing top 15 of {barChartData.labels.length} companies
                </p>
              )}
            </div>
          )}

          {/* Rankings Table */}
          <div className="table-responsive">
            <Table striped bordered hover className="mb-4">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>Rank</th>
                  <th style={{ width: "30%" }}>Company</th>
                  <th style={{ width: "10%" }}>Jobs</th>
                  <th style={{ width: "15%" }}>Applicants</th>
                  <th style={{ width: "10%" }}>Hires</th>
                  <th style={{ width: "15%" }}>Hire Rate</th>
                  <th style={{ width: "15%" }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRankings.map((company, index) => (
                  <tr key={company.companyId}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                      {company.companyName}
                    </td>
                    <td>{company.vacancies}</td>
                    <td>{company.totalApplicants}</td>
                    <td>{company.hiredApplicants}</td>
                    <td>{(company.hireRate * 100).toFixed(1)}%</td>
                    <td className="fw-semibold text-primary">
                      {company.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredRankings.length > itemsPerPage && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Showing {paginatedRankings.length} of {filteredRankings.length}{" "}
                companies {searchTerm && `matching "${searchTerm}"`}
              </div>

              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyRankings;
