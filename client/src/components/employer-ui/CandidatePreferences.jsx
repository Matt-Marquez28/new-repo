import React, { useState, useEffect } from "react";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useUser } from "../../contexts/user.context";

const CandidatePreferences = () => {
  const { setUser } = useUser();
  const triggerToast = useToast();
  const [educationalLevels, setEducationLevels] = useState([""]); // Initialize with one empty field
  const [skills, setSkills] = useState([""]); // Initialize with one empty field
  const [specializations, setSpecializations] = useState([""]); // Initialize with one empty field

  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      console.log(res.data.companyData?.candidatePreferences);

      // Set the retrieved candidate preferences to the corresponding state variables
      const { candidatePreferences } = res.data.companyData || {};

      // Ensure at least one field exists for each category
      setEducationLevels(
        candidatePreferences?.educationalLevels?.length > 0
          ? candidatePreferences.educationalLevels
          : [""]
      );
      setSkills(
        candidatePreferences?.skills?.length > 0
          ? candidatePreferences.skills
          : [""]
      );
      setSpecializations(
        candidatePreferences?.specializations?.length > 0
          ? candidatePreferences.specializations
          : [""]
      );
    } catch (error) {
      console.log(error);
    }
  };

  // Handle array changes for multiple fields
  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Add a new field to the array
  const handleAddField = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  // Remove a field from the array
  const handleRemoveField = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare the data for submission
    const payload = {
      educationalLevels: educationalLevels.filter(
        (field) => field.trim() !== ""
      ),
      skills: skills.filter((skill) => skill.trim() !== ""),
      specializations: specializations.filter(
        (specialization) => specialization.trim() !== ""
      ),
    };

    console.log("Submitting Preferences:", payload);

    try {
      const res = await axios.patch(
        `${COMPANY_API_END_POINT}/update-candidate-preferences`,
        payload,
        { withCredentials: true }
      );
      setUser((prev) => ({
        ...prev,
        companyData: {
          ...prev.companyData,
          candidatePreferences: res?.data?.candidatePreferences,
        },
      }));

      triggerToast(res?.data?.message, "primary");
    } catch (error) {
      console.error("Error updating preferences:", error);
      triggerToast(error.response.data.message, "danger");
    }
  };

  return (
    <form className="container mt-3" onSubmit={handleSubmit}>
      <div className="row align-items-center my-3">
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
        <div className="col-auto">
          <h5 className="text-primary">
            <i className="bi bi-gear-fill"></i> Candidate Preferences
          </h5>
        </div>
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>

      {/* Specializations */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <label>Specializations:</label>
          {specializations.map((specialization, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={specialization}
                onChange={(e) =>
                  handleArrayChange(setSpecializations, index, e.target.value)
                }
                placeholder="Enter specialization"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setSpecializations, index)}
                disabled={specializations.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setSpecializations)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Skills */}
        <div className="col-md-4 mb-3">
          <label>Skills:</label>
          {skills.map((skill, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={skill}
                onChange={(e) =>
                  handleArrayChange(setSkills, index, e.target.value)
                }
                placeholder="Enter skill"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setSkills, index)}
                disabled={skills.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setSkills)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Educational Levels */}
        <div className="col-md-4 mb-3">
          <label>Educational Levels:</label>
          {educationalLevels.map((level, index) => (
            <div key={index} className="input-group mb-2">
              <select
                className="form-select"
                value={level}
                onChange={(e) =>
                  handleArrayChange(setEducationLevels, index, e.target.value)
                }
              >
                <option value="">Select Educational Level</option>
                <option value="No Formal Education">No Formal Education</option>
                <option value="Some High School (No Diploma)">
                  Some High School (No Diploma)
                </option>
                <option value="High School Graduate (Diploma)">
                  High School Graduate (Diploma)
                </option>
                <option value="Some College (No Degree)">
                  Some College (No Degree)
                </option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctoral or Professional Degree">
                  Doctoral or Professional Degree
                </option>
                <option value="Post-Doctoral Studies">
                  Post-Doctoral Studies
                </option>
              </select>
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setEducationLevels, index)}
                disabled={educationalLevels.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setEducationLevels)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-floppy"></i> Save Changes
        </button>
      </div>
    </form>
  );
};

export default CandidatePreferences;
