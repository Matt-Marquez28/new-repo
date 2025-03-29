import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx-js-style";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const HiredApplicants = () => {
  const navigate = useNavigate();
  const [hiredApplicants, setHiredApplicants] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [years, setYears] = useState([]);
  const [months] = useState([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]);

  useEffect(() => {
    fetchHiredApplicants();
  }, []);

  const fetchHiredApplicants = async () => {
    try {
      const response = await axios.get(
        `${APPLICATION_API_END_POINT}/get-hired-applicants`
      );
      const groupedApplicants = groupApplicantsByMonth(
        response.data.hiredApplicants
      );
      setHiredApplicants(groupedApplicants);

      // Extract unique years from the data
      const uniqueYears = [
        ...new Set(
          response.data.hiredApplicants.map(applicant => 
            new Date(applicant.hiredDate).getFullYear()
          )
        ),
      ].sort((a, b) => b - a);

      setYears(uniqueYears);
      setSelectedYear(""); // Set default to empty string for "All Years"
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hired applicants:", error);
      setLoading(false);
    }
  };

  const groupApplicantsByMonth = (applicants) => {
    const grouped = applicants.reduce((acc, applicant) => {
      const month = new Date(applicant.hiredDate).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(applicant);
      return acc;
    }, {});

    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });

    const sortedGroupedApplicants = {};
    sortedMonths.forEach(month => {
      sortedGroupedApplicants[month] = grouped[month];
    });

    return sortedGroupedApplicants;
  };

  const exportToExcel = (month, applicantsInMonth) => {
    try {
      // Prepare the data for the Excel file using preserved data
      const data = applicantsInMonth.map(applicant => ({
        "Applicant Name": `${applicant.jobSeekerDetails?.firstName || "N/A"} ${applicant.jobSeekerDetails?.lastName || "N/A"}`,
        "Position": applicant.jobVacancyDetails?.jobTitle || "N/A",
        "Company": applicant.jobVacancyDetails?.companyName || "N/A",
        "Email": applicant.jobSeekerDetails?.emailAddress || "N/A",
        "Mobile": applicant.jobSeekerDetails?.mobileNumber || "N/A",
        "Hired Date": applicant.hiredDate ? new Date(applicant.hiredDate).toLocaleDateString() : "N/A"
      }));

      // Add main title and subtitle
      const mainTitle = "PESO City Government of Taguig";
      const subTitle = `Hired Applicants Report - ${month}`;

      const mainTitleRow = [{ v: mainTitle, t: "s" }];
      const subTitleRow = [{ v: subTitle, t: "s" }];

      // Add headers
      const headers = Object.keys(data[0]).map(header => ({
        v: header,
        t: "s",
      }));

      // Convert data to worksheet rows
      const rows = data.map(row => 
        Object.values(row).map(value => ({ v: value, t: "s" }))
      );

      // Add a total row
      const totalRow = [
        { v: "Total", t: "s" },
        { v: applicantsInMonth.length, t: "n" },
        { v: "", t: "s" },
        { v: "", t: "s" },
        { v: "", t: "s" },
        { v: "", t: "s" }
      ];

      // Combine title, headers, data, and total row
      const worksheetData = [mainTitleRow, subTitleRow, headers, ...rows, totalRow];

      // Create a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Define styles (same as before)
      const mainTitleStyle = {
        font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "2F75B5" } },
      };

      // ... (keep all your existing style definitions)

      // Apply styles (same as before)
      worksheet["A1"].s = mainTitleStyle;
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Adjusted for 6 columns
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      ];

      // ... (rest of your style application code)

      // Set column widths for the additional columns
      worksheet["!cols"] = [
        { wch: 25 }, // Applicant Name
        { wch: 20 }, // Position
        { wch: 25 }, // Company
        { wch: 25 }, // Email
        { wch: 15 }, // Mobile
        { wch: 15 }, // Hired Date
      ];

      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, month);

      // Write the file and trigger download
      XLSX.writeFile(workbook, `${month}_Hired_Applicants.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data to Excel. Please try again.");
    }
  };

  const filterApplicants = () => {
    const filteredEntries = Object.entries(hiredApplicants).filter(
      ([monthYear]) => {
        const [monthName, year] = monthYear.split(" ");
        const matchesYear = !selectedYear || year === selectedYear;
        const matchesMonth = !selectedMonth || monthName === selectedMonth;
        return matchesYear && matchesMonth;
      }
    );

    return Object.fromEntries(filteredEntries);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div>
        <div className="d-flex mb-3 align-items-center gap-2">
          <div className="d-flex align-items-center">
            <button className="btn btn-light" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-90deg-left"></i>
            </button>
          </div>
          <div className="d-flex align-items-center">
            <h5 className="card-title text-primary mb-0">
              <i className="bi bi-people-fill me-2"></i>
              Hired Applicants
            </h5>
          </div>
        </div>

        <div className="card-body">
          {/* Search Filters */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display filtered results */}
          {Object.entries(filterApplicants()).map(
            ([month, applicantsInMonth]) => (
              <div key={month} className="card mb-4">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-primary">{month}</h6>
                    <button
                      className="btn btn-success"
                      onClick={() => exportToExcel(month, applicantsInMonth)}
                    >
                      <i className="bi bi-file-earmark-excel me-2"></i>
                      Export
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    {applicantsInMonth.length > 0 ? (
                      <table className="table table-hover table-striped">
                        <thead>
                          <tr>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-people-fill me-2"></i>
                              Applicant
                            </th>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-suitcase-lg-fill me-2"></i>
                              Position
                            </th>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-building-fill me-2"></i>
                              Company
                            </th>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-envelope-fill me-2"></i>
                              Email
                            </th>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-telephone-fill me-2"></i>
                              Mobile
                            </th>
                            <th scope="col" className="small text-muted">
                              <i className="bi bi-calendar-check-fill me-2"></i>
                              Hired Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicantsInMonth.map(applicant => (
                            <tr key={applicant._id}>
                              <td className="align-middle">
                                <div className="d-flex align-items-center fw-semibold">
                                  <span className="small text-muted">
                                    {applicant.jobSeekerDetails?.firstName || "N/A"} {applicant.jobSeekerDetails?.lastName || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="small text-muted align-middle">
                                {applicant.jobVacancyDetails?.jobTitle || "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {applicant.jobVacancyDetails?.companyName || "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {applicant.jobSeekerDetails?.emailAddress || "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {applicant.jobSeekerDetails?.mobileNumber || "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {applicant.hiredDate
                                  ? new Date(applicant.hiredDate).toLocaleDateString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">
                          No applicants hired in this period.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HiredApplicants;