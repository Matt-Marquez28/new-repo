import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useUser } from "../../contexts/user.context";

const RecommendedJobSeekers = () => {
  const { user } = useUser();
  const [jobSeekers, setJobSeekers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // getAllJobSeekers();
    getRecommendedCandidates();
  }, []); // Add an empty dependency array to ensure this runs only once

  // get all job seekers
  const getAllJobSeekers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-all-jobseekers`
      );
      console.log(res?.data?.jobSeekers);
      setJobSeekers(res?.data?.jobSeekers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // get recommended candidates
  const getRecommendedCandidates = async () => {
    const candidatePreferences = user?.companyData?.candidatePreferences;
    try {
      setLoading(true);
      const res = await axios.post(
        `${JOBSEEKER_API_END_POINT}/recommended-candidates`,
        candidatePreferences
      );
      console.log(res?.data?.candidates);
      setJobSeekers(res?.data?.candidates);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // function to truncate the job description
  const truncateDescription = (description, maxLength) => {
    if (!description) {
      return "";
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div>
        {/* Loading Spinner */}
        {loading && (
          <div className="d-flex justify-content-center gap-3 my-3">
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="spinner-grow text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxHeight: "500px", overflow: "auto" }}>
      <h5 className="text-primary text-center">
        <i className="bi bi-hand-thumbs-up-fill"></i> Recommended Job Seekers {`[${jobSeekers?.length}]`}
      </h5>
      <p className="text-center">
        Recommended job seekers based on your company profile.
      </p>
      {jobSeekers.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-info-circle-fill"></i> No recommendations found.
          Try adjusting your candidate preferences in your company profile for
          better results!
        </div>
      ) : (
        jobSeekers.map((jobSeeker, index) => (
          <div
            className="border rounded p-3 text-start mb-3 shadow-sm job-list"
            key={index}
          >
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
                } // Fallback image
                alt="PHOTO"
              />
              <div className="mx-2">
                <p
                  className="m-0 p-0 text-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  {`${jobSeeker?.personalInformation?.educationalLevel}`}
                </p>
                <h5 className="m-0 p-0 fw-bold" style={{ color: "#555555" }}>
                  {`${jobSeeker?.personalInformation?.firstName} ${jobSeeker?.personalInformation?.lastName}`}
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
                  {jobSeeker?.skillsAndSpecializations?.specializations.map(
                    (specialization, index) => (
                      <span key={index} className="badge bg-info me-1">
                        {specialization}
                      </span>
                    )
                  )}
                </p>
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

            {/* footer */}
            <div className="d-flex mt-3 gap-2 justify-content-between">
              <div className="d-flex">
                <Link to={`/employer/jobseeker-details/${jobSeeker._id}`}>
                  <button type="button" className="btn btn-info text-light">
                    <i className="bi bi-info-circle"></i> More Details
                  </button>
                </Link>
                {/* <Link to={`/invite-jobseeker/${jobSeeker._id}`}>
                  <button type="button" className="btn btn-light text-info">
                    <i className="bi bi-envelope-paper-fill"></i> Send
                    Invitation
                  </button>
                </Link> */}
              </div>
              <div className="d-flex align-items-end">
                <p
                  className="m-0 p-0 text-info"
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
  );
};

export default RecommendedJobSeekers;