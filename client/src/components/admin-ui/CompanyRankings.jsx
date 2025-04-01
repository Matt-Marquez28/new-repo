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
        data: dataset.data.slice(0, 15),
      })),
    };
  }, [barChartData]);

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading rankings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-0">
      <div className="mx-auto w-full px-4 py-6 bg-light rounded">
        <h4 className="text-2xl font-bold mb-6">Top Companies</h4>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>

        {/* Bar Chart - Showing only top 15 */}
        {optimizedChartData && (
          <div className="mb-8 w-full">
            <Bar
              data={optimizedChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 30,
                      autoSkip: true,
                    },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
            {barChartData?.labels?.length > 15 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing top 15 of {barChartData.labels.length} companies
              </p>
            )}
          </div>
        )}

        {/* Rankings Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-full bg-white">
            {" "}
            {/* Ensure table expands to full width */}
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {/* Distribute columns proportionally */}
                <th className="w-[5%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Rank
                </th>
                <th className="w-[30%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Company
                </th>
                <th className="w-[10%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Jobs
                </th>
                <th className="w-[15%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Applicants
                </th>
                <th className="w-[10%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Hires
                </th>
                <th className="w-[15%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Hire Rate
                </th>
                <th className="w-[15%] py-2 px-3 text-left text-sm font-medium text-gray-700">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedRankings.map((company, index) => (
                <tr key={company.companyId} className="hover:bg-gray-50">
                  <td className="w-[5%] py-2 px-3 text-sm">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="w-[30%] py-2 px-3 text-sm font-medium truncate">
                    {company.companyName}
                  </td>
                  <td className="w-[10%] py-2 px-3 text-sm">
                    {company.vacancies}
                  </td>
                  <td className="w-[15%] py-2 px-3 text-sm">
                    {company.totalApplicants}
                  </td>
                  <td className="w-[10%] py-2 px-3 text-sm">
                    {company.hiredApplicants}
                  </td>
                  <td className="w-[15%] py-2 px-3 text-sm">
                    {(company.hireRate * 100).toFixed(1)}%
                  </td>
                  <td className="w-[15%] py-2 px-3 text-sm font-semibold text-blue-600">
                    {company.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredRankings.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {paginatedRankings.length} of {filteredRankings.length}{" "}
          companies
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>
    </div>
  );
};

export default CompanyRankings;
