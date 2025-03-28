import React, { useEffect, useState } from "react";
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Top Companies</h2>

      {/* Bar Chart */}
      {barChartData && (
        <div className="mb-8">
          <Bar
            data={barChartData}
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
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}

      {/* Rankings Table */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left">Rank</th>
              <th className="py-3 px-6 text-left">Company</th>
              <th className="py-3 px-6 text-left">Jobs</th>
              <th className="py-3 px-6 text-left">Applicants</th>
              <th className="py-3 px-6 text-left">Hires</th>
              <th className="py-3 px-6 text-left">Hire Rate</th>
              <th className="py-3 px-6 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((company, index) => (
              <tr
                key={company.companyId}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">{index + 1}</td>
                <td className="py-4 px-6 font-medium">{company.companyName}</td>
                <td className="py-4 px-6">{company.vacancies}</td>
                <td className="py-4 px-6">{company.totalApplicants}</td>
                <td className="py-4 px-6">{company.hiredApplicants}</td>
                <td className="py-4 px-6">
                  {(company.hireRate * 100).toFixed(1)}%
                </td>
                <td className="py-4 px-6 font-semibold text-blue-600">
                  {company.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyRankings;
