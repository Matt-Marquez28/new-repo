import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { APPLICATION_API_END_POINT } from "../../utils/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  const [chartData, setChartData] = useState({
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Hired Applicants",
        data: Array(12).fill(0),
        borderColor: "#007bff", // Bootstrap primary color
        backgroundColor: "rgba(0, 123, 255, 0.2)", // Lightened version of the primary color
        tension: 0.4,
        pointBackgroundColor: "#007bff", // Bootstrap primary color for points
        pointBorderColor: "#007bff", // Bootstrap primary color for point borders
        pointRadius: 5,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${APPLICATION_API_END_POINT}/get-hired-applicants`
        );
        const hiredApplicants = response.data.hiredApplicants;
        console.log(hiredApplicants);

        const currentYear = new Date().getFullYear();
        const monthlyCounts = Array(12).fill(0);

        hiredApplicants.forEach((applicant) => {
          const hiredDate = new Date(applicant.hiredDate);
          const year = hiredDate.getFullYear();

          if (year === currentYear) {
            const monthIndex = hiredDate.getMonth();
            monthlyCounts[monthIndex]++;
          }
        });

        setChartData((prevData) => ({
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              data: monthlyCounts,
            },
          ],
        }));
      } catch (error) {
        console.error("Error fetching hired applicants:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monthly Hired Applicants (Current Year)",
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true, // Start Y-axis at 0
      },
    },
  };

  return (
    <div
      className="my-3 rounded shadow-sm bg-light"
      style={{
        padding: "20px",
      }}
    >
      <h4
        className="card-title mb-0 ms-3 fw-bold"
        style={{ color: "#555555" }}
      ></h4>
      <div style={{ width: "100%", height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
