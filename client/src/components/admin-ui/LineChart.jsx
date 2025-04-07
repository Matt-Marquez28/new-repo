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
  Filler,
} from "chart.js";
import { APPLICATION_API_END_POINT } from "../../utils/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = () => {
  const [chartData, setChartData] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Hired Applicants",
        data: Array(12).fill(0),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        borderWidth: 3, // Increased from 2 to 3
        tension: 0.3,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#007bff",
        pointBorderWidth: 3, // Increased from 2 to 3
        pointRadius: 5, // Increased from 4 to 5
        pointHoverRadius: 7, // Increased from 6 to 7
        fill: true,
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [totalHires, setTotalHires] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${APPLICATION_API_END_POINT}/get-hired-applicants`
        );
        const hiredApplicants = response.data.hiredApplicants || [];

        const currentYear = new Date().getFullYear();
        const monthlyCounts = Array(12).fill(0);
        let total = 0;

        hiredApplicants.forEach((applicant) => {
          const hiredDate = new Date(applicant.hiredDate);
          const year = hiredDate.getFullYear();

          if (year === currentYear) {
            const monthIndex = hiredDate.getMonth();
            monthlyCounts[monthIndex]++;
            total++;
          }
        });

        setTotalHires(total);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#6c757d",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6c757d",
          stepSize: 1,
          precision: 0,
        },
      },
    },
    elements: {
      line: {
        cubicInterpolationMode: "monotone",
        borderWidth: 3, // Added line element border width
      },
      point: {
        radius: 5, // Consolidated point size configuration
        hoverRadius: 7,
      },
    },
  };

  return (
    <div
      className="card rounded-3 shadow-sm my-3"
      style={{
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderLeft: "4px solid #007bff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                }}
              >
                <i
                  className="bi-suitcase-lg-fill"
                  style={{ color: "#007bff", fontSize: "1rem" }}
                ></i>
              </div>
              <h5
                className="card-title mb-0 ms-3 fw-semibold"
                style={{ color: "#495057" }}
              >
                Hiring Trends
              </h5>
            </div>

            <p className="text-muted small mb-0">
              Monthly hiring patterns for {new Date().getFullYear()}
            </p>
          </div>
          {!loading && (
            <div className="bg-primary bg-opacity-10 rounded-pill px-3 py-1">
              <span className="text-primary fw-semibold">
                {totalHires} Total Hires
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "350px" }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div style={{ height: "350px", position: "relative" }}>
            <Line
              data={chartData}
              options={options}
              plugins={[
                {
                  id: "customCanvasBackground",
                  beforeDraw: (chart) => {
                    const { ctx, width, height } = chart;
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, width, height);
                  },
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;
