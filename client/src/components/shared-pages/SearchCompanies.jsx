import React, { useState, useEffect } from "react";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { Link } from "react-router-dom";
import default_company from "../../images/default-company.jpg";
import { useNavigate } from "react-router-dom";

const SearchCompanies = () => {
  const navigate = useNavigate();
  // State with localStorage persistence
  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem("companyName") || "";
  });

  const [industry, setIndustry] = useState(() => {
    return localStorage.getItem("industry") || "all";
  });

  const [companySize, setCompanySize] = useState(() => {
    return localStorage.getItem("companySize") || "all";
  });

  const [location, setLocation] = useState(() => {
    return localStorage.getItem("location") || "";
  });

  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem("companies");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("industry", industry);
    localStorage.setItem("companySize", companySize);
    localStorage.setItem("location", location);
    localStorage.setItem("companies", JSON.stringify(companies));
  }, [companyName, industry, companySize, location, companies]);

  // Function to get badge color based on company size
  const getCompanySizeBadgeClass = (size) => {
    switch (size) {
      case "micro":
        return "bg-secondary";
      case "small":
        return "bg-info";
      case "medium":
        return "bg-primary";
      case "large":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = {
        companyName,
        industry: industry !== "all" ? industry : undefined,
        companySize: companySize !== "all" ? companySize : undefined,
        location: location.trim() || undefined,
      };

      const res = await axios.get(`${COMPANY_API_END_POINT}/search-companies`, {
        params,
      });

      // Ensure we always set an array
      const data = res?.data.data;
      console.log(data);
      if (!data) {
        setCompanies([]);
      } else {
        setCompanies(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      setError("Failed to fetch companies. Please try again.");
      setCompanies([]);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const truncateDescription = (description = "", maxLength = 400) => {
    if (!description || description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <div className="container">
      <div className="d-flex my-2 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-light text-dark"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <h5 className="my-2 text-primary">
            <i className="bi bi-search"></i> Search Companies
          </h5>
        </div>
      </div>
      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="d-flex justify-content-center">
          <div className="input-group mb-3" style={{ width: "100%" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for companies by name (e.g., Tech Solutions, ABC Corp)"
              onChange={(e) => setCompanyName(e.target.value)}
              value={companyName}
              style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            />
            <button className="btn btn-primary text-light" type="submit">
              <i className="bi bi-search"></i>{" "}
              <span className="d-none d-sm-inline">Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-4 text-start">
        <div className="row">
          {/* Industry Filter */}
          <div className="col-6 col-md-3 mb-3 mb-md-0">
            <select
              className="form-select"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="all">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
            </select>
          </div>

          {/* Company Size Filter */}
          <div className="col-6 col-md-3 mb-3 mb-md-0">
            <select
              className="form-select"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            >
              <option value="all">All Sizes</option>
              <option value="micro">Micro</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="City or Province"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error Handling */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading Spinner */}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Company List */}
      <div style={{ maxHeight: "500px", overflow: "auto" }}>
        {!loading && companies.length === 0 ? (
          <p className="text-center">
            No companies found matching your criteria.
          </p>
        ) : (
          companies.map((company) => (
            <div
              className="border rounded bg-light p-3 text-start mb-3 company-list shadow-sm job-list"
              key={company._id}
            >
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <img
                    className="border shadow-sm"
                    style={{
                      height: "90px",
                      width: "90px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                    src={company?.companyLogo || default_company}
                    alt={`${company.companyInformation?.businessName} LOGO`}
                  />
                  <div className="mx-2">
                    <h5
                      className="m-0 p-0 fw-bold"
                      style={{ color: "#555555" }}
                    >
                      {company?.businessName}
                    </h5>
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {company?.industry}
                    </p>
                    <p
                      className="m-0 p-0 text-primary fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-geo-alt-fill"></i>{" "}
                      {company?.location?.cityMunicipality},{" "}
                      {company?.location?.province}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`badge ${getCompanySizeBadgeClass(
                      company?.companySize
                    )} text-light px-3 py-1`}
                  >
                    {company?.companySize}
                  </span>
                </div>
              </div>

              {/* Company Description */}
              <div className="text-secondary mt-3 p-2 bg-white rounded border border-primary border-opacity-25">
                <p className="m-0" style={{ fontSize: "0.85rem" }}>
                  {truncateDescription(company?.description) || (
                    <span className="text-muted">No description available</span>
                  )}
                </p>
              </div>

              {/* Footer */}
              <div className="d-flex mt-3 justify-content-between align-items-center">
                <div>
                  <Link to={`/jobseeker/company-information/${company._id}`}>
                    <button type="button" className="btn btn-info text-light">
                      <i className="bi bi-info-circle d-none d-md-inline-block"></i>{" "}
                      Company Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchCompanies;
