import React, { useEffect, useState } from "react";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { useUser } from "../../contexts/user.context";

const SkillsAndSpecializations = () => {
  const { setUser } = useUser();
  const triggerToast = useToast();
  const [specializations, setSpecializations] = useState([""]);
  const [coreSkills, setCoreSkills] = useState([""]);
  const [softSkills, setSoftSkills] = useState([""]);

  useEffect(() => {
    fetchSkillsAndSpecialization();
  }, []);

  const fetchSkillsAndSpecialization = async () => {
    try {
      const response = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );

      const data = response?.data?.jobSeekerData?.skillsAndSpecializations;
      setSpecializations(data?.specializations || [""]);
      setCoreSkills(data?.coreSkills || [""]);
      setSoftSkills(data?.softSkills || [""]);
    } catch (error) {
      console.error("Error fetching skills and specialization:", error);
    }
  };

  const handleArrayChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  const handleRemoveField = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      specializations: specializations.filter((field) => field.trim() !== ""),
      coreSkills: coreSkills.filter((skill) => skill.trim() !== ""),
      softSkills: softSkills.filter((skill) => skill.trim() !== ""),
    };

    console.log("Submitting Skills and Specialization:", payload);

    try {
      const response = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-skills-and-specializations`,
        payload,
        { withCredentials: true }
      );
      console.log("Update successful:", response?.data?.message);
      triggerToast(response?.data?.message, "primary");
      setUser((prev) => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          skillsAndSpecializations: response?.data?.skillsAndSpecializations,
        },
      }));
      fetchSkillsAndSpecialization();
    } catch (error) {
      console.error(
        "Error updating skills and specialization:",
        error?.response?.data?.message
      );
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  return (
    <form className="container mt-3" onSubmit={handleSubmit}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="">
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#1a4798",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <i className="bi bi-gear-wide-connected text-white"></i>
            </div>
            <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
              Skills & Specializations
            </h5>
          </div>
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

        {/* Core Skills */}
        <div className="col-md-4 mb-3">
          <label>Core Skills:</label>
          {coreSkills.map((skill, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={skill}
                onChange={(e) =>
                  handleArrayChange(setCoreSkills, index, e.target.value)
                }
                placeholder="Enter core skill"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setCoreSkills, index)}
                disabled={coreSkills.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setCoreSkills)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>

        {/* Soft Skills */}
        <div className="col-md-4 mb-3">
          <label>Soft Skills:</label>
          {softSkills.map((skill, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={skill}
                onChange={(e) =>
                  handleArrayChange(setSoftSkills, index, e.target.value)
                }
                placeholder="Enter soft skill"
              />
              <button
                type="button"
                className="btn btn-info"
                onClick={() => handleRemoveField(setSoftSkills, index)}
                disabled={softSkills.length === 1}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => handleAddField(setSoftSkills)}
          >
            <i className="bi bi-plus-circle"></i> Add More
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn text-white"  style={{ backgroundColor: "#1a4798" }}>
          <i className="bi bi-floppy"></i> Save Changes
        </button>
      </div>
    </form>
  );
};

export default SkillsAndSpecializations;
