import React, { useEffect, useState } from "react";
import axios from "axios";
import XLSX from "xlsx-js-style"; // Use xlsx-js-style for styling
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const AccreditedCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [years, setYears] = useState([]);
  const [months] = useState([
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
  ]);

  useEffect(() => {
    getAccreditedCompanies();
  }, []);

  const getAccreditedCompanies = async () => {
    try {
      const response = await axios.get(
        `${COMPANY_API_END_POINT}/get-accredited-companies`
      );
      const groupedCompanies = groupCompaniesByMonth(response.data.companies);
      setCompanies(groupedCompanies);

      const uniqueYears = [
        ...new Set(
          response.data.companies.map((company) =>
            new Date(company.accreditationDate).getFullYear()
          )
        ),
      ].sort((a, b) => b - a);

      setYears(uniqueYears);
      setSelectedYear(uniqueYears[0]?.toString() || "");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching accredited companies:", error);
      setLoading(false);
    }
  };

  const groupCompaniesByMonth = (companies) => {
    const grouped = companies.reduce((acc, company) => {
      const month = new Date(company.accreditationDate).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
      );
      if (!acc[month]) acc[month] = [];
      acc[month].push(company);
      return acc;
    }, {});

    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA;
    });

    const sortedGroupedCompanies = {};
    sortedMonths.forEach((month) => {
      sortedGroupedCompanies[month] = grouped[month];
    });

    return sortedGroupedCompanies;
  };

  const formatTIN = (tin) => {
    if (!tin) return "N/A";

    // Remove any non-numeric characters
    const numericTIN = tin.replace(/\D/g, "");

    // Format the TIN as XXX-XXX-XXX-XXX
    if (numericTIN.length === 12) {
      return `${numericTIN.slice(0, 3)}-${numericTIN.slice(
        3,
        6
      )}-${numericTIN.slice(6, 9)}-${numericTIN.slice(9)}`;
    }

    // If the TIN doesn't match the expected length, return it as is
    return numericTIN;
  };

  const exportToExcel = (month, companiesInMonth) => {
    // Prepare the data for the Excel file
    const data = companiesInMonth.map((company) => ({
      "Company Name": company?.companyInformation?.businessName || "N/A",
      "Tin Number": formatTIN(company?.companyInformation?.tinNumber),
      "Business Type": company?.companyInformation?.typeOfBusiness || "N/A",
      Industry: company?.companyInformation?.industry || "N/A",
      "Accreditation Date": new Date(
        company.accreditationDate
      ).toLocaleDateString(),
    }));

    // Add main title and subtitle
    const mainTitle = "PESO City Government of Taguig";
    const subTitle = `Accredited Companies Report - ${month}`;

    const mainTitleRow = [{ v: mainTitle, t: "s" }]; // Main title as a single cell
    const subTitleRow = [{ v: subTitle, t: "s" }]; // Subtitle as a single cell

    // Add headers
    const headers = Object.keys(data[0]).map((header) => ({
      v: header,
      t: "s", // String type
    }));

    // Convert data to worksheet rows
    const rows = data.map((row) =>
      Object.values(row).map((value) => ({ v: value, t: "s" }))
    );

    // Add a total row
    const totalRow = [
      { v: "Total", t: "s" }, // Label for the total row
      { v: companiesInMonth.length, t: "n" }, // Total count of companies
      { v: "", t: "s" }, // Empty cells for other columns
      { v: "", t: "s" },
      { v: "", t: "s" },
    ];

    // Combine title, headers, data, and total row
    const worksheetData = [
      mainTitleRow,
      subTitleRow,
      headers,
      ...rows,
      totalRow,
    ];

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Define styles
    const mainTitleStyle = {
      font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } }, // Larger font for main title
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "2F75B5" } }, // Dark blue background
    };

    const subTitleStyle = {
      font: { bold: true, sz: 14, color: { rgb: "000000" } }, // Medium font for subtitle
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "D9E1F2" } }, // Light blue background
    };

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "5B9BD5" } }, // Blue background
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const cellStyle = {
      alignment: { horizontal: "left" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const totalStyle = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "A9D08E" } }, // Light green background
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Apply main title style
    worksheet["A1"].s = mainTitleStyle;
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge cells for the main title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Merge cells for the subtitle
    ];

    // Apply subtitle style
    worksheet["A2"].s = subTitleStyle;

    // Apply header styles
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 2, c: C }); // Headers are in the third row
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    // Apply cell styles
    for (let R = 3; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = cellStyle;
      }
    }

    // Apply total row style
    const totalRowIndex = range.e.r;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = totalStyle;
    }

    // Set column widths for portrait mode
    worksheet["!cols"] = [
      { wch: 25 }, // Company Name (reduced width)
      { wch: 15 }, // Tin Number (reduced width)
      { wch: 20 }, // Business Type
      { wch: 20 }, // Industry
      { wch: 15 }, // Accreditation Date (reduced width)
    ];

    // Add page setup for better PDF export in portrait mode
    worksheet["!pageSetup"] = {
      fitToWidth: 1, // Fit to one page wide
      fitToHeight: 0, // Allow multiple pages tall
    };

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, month);

    // Write the file and trigger download
    XLSX.writeFile(workbook, `${month}.xlsx`);
  };

  const filterCompanies = () => {
    const filteredEntries = Object.entries(companies).filter(([monthYear]) => {
      const [monthName, year] = monthYear.split(" ");
      const matchesYear = !selectedYear || year === selectedYear;
      const matchesMonth = !selectedMonth || monthName === selectedMonth;
      return matchesYear && matchesMonth;
    });

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
      <div className="d-flex mb-3 align-items-center gap-2">
        <div className="d-flex align-items-center">
          <button className="btn btn-light" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
          </button>
        </div>
        <div className="d-flex align-items-center">
          <h5 className="card-title text-primary mb-0">
            <i className="bi bi-building-fill-check"></i> Accredited Companies
          </h5>
        </div>
      </div>
      <div>
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
                {years.map((year) => (
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
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display filtered results */}
          {Object.entries(filterCompanies()).map(
            ([month, companiesInMonth]) => (
              <div key={month} className="card mb-4">
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-primary">
                      <i className="bi bi-calendar3 me-2"></i>
                      {month}
                    </h6>
                    <button
                      className="btn btn-success"
                      onClick={() => exportToExcel(month, companiesInMonth)}
                    >
                      <i className="bi bi-file-earmark-excel me-2"></i>
                      Export
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="table-responsive">
                    {companiesInMonth.length > 0 ? (
                      <table className="table table-hover table-striped">
                        <thead>
                          <tr>
                            <th className="small text-muted">
                              <i className="bi bi-building-fill me-2"></i>
                              Company Name
                            </th>
                            <th className="small text-muted">
                              <i className="bi bi-upc-scan me-2"></i>Tin No.
                            </th>
                            <th className="small text-muted">
                              <i className="bi bi-suitcase-lg-fill me-2"></i>
                              Business Type
                            </th>
                            <th className="small text-muted">
                              <i className="bi bi-gear-wide me-2"></i>Industry
                            </th>
                            <th className="small text-muted">
                              <i className="bi bi-calendar-check-fill me-2"></i>
                              Accreditation Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {companiesInMonth.map((company) => (
                            <tr key={company._id}>
                              <td className="small text-muted align-middle fw-semibold">
                                {/* {company?.companyInformation?.companyLogo && (
                                  <img
                                    src={
                                      company?.companyInformation.companyLogo
                                    }
                                    alt={
                                      company.companyInformation.businessName ||
                                      "Company Logo"
                                    }
                                    className="me-2 border shadow-sm"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                    }}
                                  />
                                )} */}
                                {company?.companyInformation?.businessName ||
                                  "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {formatTIN(
                                  company?.companyInformation?.tinNumber
                                )}
                              </td>
                              <td className="small text-muted align-middle">
                                {company?.companyInformation?.typeOfBusiness ||
                                  "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {company?.companyInformation?.industry || "N/A"}
                              </td>
                              <td className="small text-muted align-middle">
                                {new Date(
                                  company.accreditationDate
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">
                          No companies accredited in this period.
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

export default AccreditedCompanies;
