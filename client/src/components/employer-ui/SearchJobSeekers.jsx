import React, { useState, useEffect } from "react";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const SearchJobSeekers = () => {
  // Load state from localStorage or use initial state
  const [specialization, setSpecialization] = useState(() => {
    const savedSpecialization = localStorage.getItem("specialization");
    return savedSpecialization || "";
  });

  const [jobSeekers, setJobSeekers] = useState(() => {
    const savedJobSeekers = localStorage.getItem("jobSeekers");
    return savedJobSeekers ? JSON.parse(savedJobSeekers) : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("specialization", specialization);
  }, [specialization]);

  useEffect(() => {
    localStorage.setItem("jobSeekers", JSON.stringify(jobSeekers));
  }, [jobSeekers]);

  // Function to truncate the job description
  const truncateDescription = (description, maxLength) => {
    if (!description) {
      return "";
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  const handleInputChange = (e) => {
    setSpecialization(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!specialization.trim()) return;

    setLoading(true);
    setError("");

    // Add slight delay before making the API request
    setTimeout(async () => {
      try {
        const params = {
          specialization: specialization.trim(),
        };
        const response = await axios.get(
          `${JOBSEEKER_API_END_POINT}/search-job-seekers`,
          { params }
        );

        if (response.data && Array.isArray(response.data.jobSeekers)) {
          setJobSeekers(response.data.jobSeekers);
        } else {
          setJobSeekers([]);
          setError("Invalid response format from server");
        }
      } catch (error) {
        setJobSeekers([]);
        setError(
          error.response?.data?.message ||
            "An error occurred while searching. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, 1500); // 1500ms delay before making the API request
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSearch}>
        <div className="d-flex justify-content-center">
          <div className="input-group mb-3" style={{ width: "100%" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for job seekers by specialization (e.g., Web Development, Graphic Design)"
              value={specialization}
              onChange={handleInputChange}
              style={{ backgroundColor: "aliceblue", borderColor: "#3B71CA" }}
            />
            <button
              className="btn btn-primary text-light"
              type="submit"
              disabled={loading}
            >
              <i className="bi bi-search"></i>{" "}
              <span className="d-none d-sm-inline"> Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* Error handling */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading Spinner */}
      {loading && (
        <div>
          {/* Loading Spinner */}
          {loading && (
            <div className="d-flex justify-content-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      <div style={{ maxHeight: "500px", overflow: "auto" }}>
        {jobSeekers.length === 0 && !loading ? (
          <p className="text-center">No job seekers found.</p>
        ) : (
          jobSeekers.map((jobSeeker, index) => (
            <div
              className="border rounded p-3 bg-light text-start mb-3 shadow-sm"
              key={jobSeeker._id || index}
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
                    src={
                      jobSeeker?.personalInformation?.photo ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJxKGGpPc9-5g25KWwnsCCy9O_dlS4HWo5A&s"
                    }
                    alt={`${
                      jobSeeker?.personalInformation?.firstName || "User"
                    }'s photo`}
                  />
                  <div className="mx-2">
                    <h5
                      className="m-0 p-0 fw-bold"
                      style={{ color: "#555555" }}
                    >
                      {`${jobSeeker?.personalInformation?.firstName || ""} ${
                        jobSeeker?.personalInformation?.lastName || ""
                      }`}
                    </h5>
                    <p
                      className="m-0 p-0 text-secondary"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-geo-fill"></i>{" "}
                      {`${jobSeeker?.personalInformation?.street}, ${jobSeeker?.personalInformation?.barangay}, ${jobSeeker?.personalInformation?.cityMunicipality}, ${jobSeeker?.personalInformation?.province}`}
                    </p>
                    <p
                      className="text-secondary m-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {jobSeeker?.skillsAndSpecializations?.specializations?.map(
                        (specialization, index) => (
                          <span key={index} className="badge bg-info me-1">
                            {specialization}
                          </span>
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="text-secondary my-2"
                style={{ fontSize: "0.85rem" }}
              >
                <p>{`About me: ${truncateDescription(
                  jobSeeker?.personalInformation?.aboutMe,
                  400
                )}`}</p>
              </div>

              {/* Footer */}
              <div className="d-flex mt-3 gap-2 justify-content-between">
                <div className="d-flex gap-2">
                  <Link to={`/employer/jobseeker-details/${jobSeeker._id}`}>
                    <button type="button" className="btn btn-info text-light">
                      <i className="bi bi-info-circle"></i> Details
                    </button>
                  </Link>
                </div>
                <div className="d-flex align-items-end">
                  <p
                    className="m-0 p-0 text-info d-none d-sm-inline"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-envelope-fill"></i>{" "}
                    {jobSeeker?.personalInformation?.emailAddress} |{" "}
                    <i className="bi bi-phone-fill"></i>{" "}
                    {jobSeeker?.personalInformation?.mobileNumber}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchJobSeekers;
