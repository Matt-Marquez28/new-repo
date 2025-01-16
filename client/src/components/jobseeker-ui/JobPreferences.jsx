import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useUser } from "../../contexts/user.context";

const JobPreferences = () => {
  const { setUser } = useUser();
  // Toast context for showing notifications
  const triggerToast = useToast();

  // State variables for job preferences
  const [jobPositions, setJobPositions] = useState([""]);
  const [locations, setLocations] = useState([""]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(100000);
  const [employmentType, setEmploymentType] = useState("");
  const [salaryType, setSalaryType] = useState("");
  const [industries, setIndustries] = useState([""]);

  // Industry options
  const industryOptions = [
    "Business Process Outsourcing (BPO)",
    "Sales",
    "Food Service",
    "Healthcare",
    "Construction",
    "Education",
    "Information Technology (IT)",
    "Manufacturing",
    "Finance",
    "Retail",
    "Transportation and Logistics",
    "Telecommunications",
    "Real Estate",
    "Legal Services",
    "Government",
    "Agriculture",
    "Energy",
    "Tourism and Hospitality",
    "Media and Entertainment",
    "Research and Development",
    "Consulting",
    "Insurance",
    "Marketing and Advertising",
    "Human Resources",
    "Security Services",
    "Environmental Services",
    "Arts and Design",
    "Sports and Recreation",
    "Non-Profit and Social Services",
    "Science and Technology",
    "Automotive",
    "Textiles and Apparel",
    "Pharmaceuticals",
    "Aerospace",
    "Marine",
    "Mining",
    "Forestry",
    "Veterinary Services",
    "Public Relations",
    "Event Management",
    "Interior Design",
    "Architecture",
    "Education and Training",
    "Translation and Interpretation",
    "Photography and Videography",
    "Fitness and Wellness",
    "Legal and Compliance",
    "Supply Chain and Logistics",
    "Quality Assurance",
    "Customer Service",
    "Technical Support",
  ];

  // Fetch job preferences when component mounts
  useEffect(() => {
    fetchJobPreferences();
  }, []);

  // Fetch existing job preferences from the server
  const fetchJobPreferences = async () => {
    try {
      const response = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );

      const jobPreferences =
        response?.data?.jobSeekerData?.jobPreferences || {};

      // Update state with fetched preferences or default values
      setJobPositions(jobPreferences.jobPositions || [""]);
      setLocations(jobPreferences.locations || [""]);
      setSalaryMin(jobPreferences.salaryMin || 0);
      setSalaryMax(jobPreferences.salaryMax || 100000);
      setEmploymentType(jobPreferences.employmentType || "");
      setSalaryType(jobPreferences.salaryType || "");
      setIndustries(jobPreferences.industries || [""]);
    } catch (error) {
      console.error("Error fetching job preferences:", error);
      triggerToast("Failed to fetch job preferences", "danger");
    }
  };

  // Handle changes to array-based fields (job positions, locations, industries)
  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Add a new field to an array
  const handleAddField = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  // Remove a field from an array
  const handleRemoveField = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle salary range changes
  const handleSalaryMinChange = (e) => setSalaryMin(Number(e.target.value));
  const handleSalaryMaxChange = (e) => setSalaryMax(Number(e.target.value));

  // Submit job preferences
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare payload, filtering out empty entries
    const payload = {
      jobPositions: jobPositions.filter((position) => position.trim() !== ""),
      locations: locations.filter((location) => location.trim() !== ""),
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      employmentType,
      salaryType: salaryType,
      industries: industries.filter((industry) => industry.trim() !== ""),
    };

    try {
      const response = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-job-preferences`,
        payload,
        { withCredentials: true }
      );

      setUser((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          jobPreferences: response.data.jobPreferences,
        },
      }));
      fetchJobPreferences();
      triggerToast(
        response?.data?.message || "Preferences updated successfully",
        "success"
      );
    } catch (error) {
      console.error(
        "Error updating job preferences:",
        error?.response?.data?.message
      );
      triggerToast(
        error?.response?.data?.message || "Failed to update preferences",
        "danger"
      );
    }
  };

  return (
    <form className="container mt-3" onSubmit={handleSubmit}>
      {/* Section Header */}
      <div className="row align-items-center my-3">
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
        <div className="col-auto">
          <h5 className="text-primary">
            <i className="bi bi-sliders"></i> Job Preferences
          </h5>
        </div>
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>

      <div className="row mb-4">
        {/* Preferred Job Positions */}
        <div className="col-md-4 mb-3">
          <label>Preferred Job Positions:</label>
          {jobPositions.map((position, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={position}
                onChange={(e) =>
                  handleArrayChange(setJobPositions, index, e.target.value)
                }
                placeholder="Enter job position"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setJobPositions, index)}
                disabled={jobPositions.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setJobPositions)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Preferred Locations */}
        <div className="col-md-4 mb-3">
          <label>Preferred Locations:</label>
          {locations.map((location, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={location}
                onChange={(e) =>
                  handleArrayChange(setLocations, index, e.target.value)
                }
                placeholder="Enter location"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setLocations, index)}
                disabled={locations.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setLocations)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Preferred Employment Type */}
        <div className="col-md-4 mb-3">
          <label>Preferred Employment Type:</label>
          <select
            className="form-select"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="">Select Employment Type</option>
            <option value="permanent">Permanent</option>
            <option value="part-time">Part-time</option>
            <option value="contractual">Contract</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        {/* Preferred Industries */}
        <div className="col-md-4 mb-3">
          <label>Preferred Industries:</label>
          {industries.map((industry, index) => (
            <div key={index} className="input-group mb-2">
              <select
                className="form-select"
                value={industry}
                onChange={(e) =>
                  handleArrayChange(setIndustries, index, e.target.value)
                }
              >
                <option value="">Select Industry</option>
                {industryOptions.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setIndustries, index)}
                disabled={industries.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setIndustries)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Salary Type */}
        <div className="col-md-4 mb-3">
          <label>Preferred Salary Type:</label>
          <select
            className="form-select"
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value)}
          >
            <option value="">Select Salary Type</option>
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Salary Min */}
        <div className="col-md-2">
          <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="salaryMin" className="mb-0">
              Min Salary
            </label>
            <span className="text-primary">P {salaryMin.toLocaleString()}</span>
          </div>
          <input
            type="range"
            id="salaryMin"
            className="form-range"
            min="0"
            max="100000"
            step="1000"
            value={salaryMin}
            onChange={handleSalaryMinChange}
          />
        </div>

        {/* Salary Max */}
        <div className="col-md-2">
          <div className="d-flex justify-content-between align-items-center">
            <label htmlFor="salaryMax" className="mb-0">
              Max Salary
            </label>
            <span className="text-primary">P {salaryMax.toLocaleString()}</span>
          </div>
          <input
            type="range"
            id="salaryMax"
            className="form-range"
            min="0"
            max="100000"
            step="1000"
            value={salaryMax}
            onChange={handleSalaryMaxChange}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-floppy"></i> Save Preferences
        </button>
      </div>
    </form>
  );
};

export default JobPreferences;
