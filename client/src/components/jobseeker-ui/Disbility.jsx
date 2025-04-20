import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const DisabilityForm = ({ initialData, jobSeekerId }) => {
  const triggerToast = useToast();
  const [disabilities, setDisabilities] = useState({
    none: initialData?.hasDisability === false || false,
    visual: initialData?.types?.includes("visual") || false,
    speech: initialData?.types?.includes("speech") || false,
    mental: initialData?.types?.includes("mental") || false,
    hearing: initialData?.types?.includes("hearing") || false,
    physical: initialData?.types?.includes("physical") || false,
    others: initialData?.types?.includes("others") || false,
    othersText: initialData?.otherDescription || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const disabilityOptions = [
    { id: "none", label: "None" },
    { id: "visual", label: "Visual" },
    { id: "speech", label: "Speech" },
    { id: "mental", label: "Mental" },
    { id: "hearing", label: "Hearing" },
    { id: "physical", label: "Physical" },
    { id: "others", label: "Others (Please specify)" },
  ];

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );
      if (res?.data?.jobSeekerData?.disability) {
        setDisabilities({
          none: res?.data?.jobSeekerData?.disability?.hasDisability === false,
          visual:
            res?.data?.jobSeekerData?.disability?.types?.includes("visual"),
          speech:
            res?.data?.jobSeekerData?.disability?.types?.includes("speech"),
          mental:
            res?.data?.jobSeekerData?.disability?.types?.includes("mental"),
          hearing:
            res?.data?.jobSeekerData?.disability?.types?.includes("hearing"),
          physical:
            res?.data?.jobSeekerData?.disability?.types?.includes("physical"),
          others:
            res?.data?.jobSeekerData?.disability?.types?.includes("others"),
          othersText:
            res?.data?.jobSeekerData?.disability?.otherDescription || "",
        });
      }
    } catch (error) {
      console.error("Error fetching disability data:", error);
      triggerToast("Failed to load disability information", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    // If "None" is checked, uncheck all other options
    if (name === "none" && checked) {
      setDisabilities((prev) => ({
        ...prev,
        none: true,
        visual: false,
        speech: false,
        mental: false,
        hearing: false,
        physical: false,
        others: false,
        othersText: "",
      }));
      return;
    }

    // If any other option is checked, uncheck "None"
    setDisabilities((prev) => ({
      ...prev,
      [name]: checked,
      none: name !== "none" && checked ? false : prev.none,
    }));
  };

  const handleOthersTextChange = (e) => {
    setDisabilities((prev) => ({
      ...prev,
      othersText: e.target.value,
    }));
  };

  const preparePayload = () => {
    if (disabilities.none) {
      return {
        hasDisability: false,
        types: [],
        otherDescription: "",
      };
    }

    const selectedTypes = disabilityOptions
      .filter((option) => option.id !== "none" && disabilities[option.id])
      .map((option) => option.id);

    return {
      hasDisability: selectedTypes.length > 0,
      types: selectedTypes,
      otherDescription: disabilities.others ? disabilities.othersText : "",
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = preparePayload();

      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-disability`,
        { payload },
        { withCredentials: true }
      );

      triggerToast(
        res?.data?.message || "Disability information updated successfully",
        "success"
      );
    } catch (error) {
      console.error("Update failed:", error);
      triggerToast(
        error?.response?.data?.message ||
          "Failed to update disability information",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-3">
      {/* Section Header */}
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative" style={{ color: "#1a4798" }}>
            <i className="bi bi-universal-access-circle"></i> Disability
            Information
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">Please select all that apply:</p>

          <div className="p-3 rounded bg-light border">
            {/* First row with 3 checkboxes */}
            <div className="row mb-3">
              {disabilityOptions.slice(0, 3).map((option) => (
                <div key={option.id} className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${option.id}Checkbox`}
                      name={option.id}
                      checked={disabilities[option.id]}
                      onChange={handleCheckboxChange}
                      disabled={isSubmitting}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`${option.id}Checkbox`}
                    >
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row with 3 checkboxes */}
            <div className="row mb-3">
              {disabilityOptions.slice(3, 6).map((option) => (
                <div key={option.id} className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${option.id}Checkbox`}
                      name={option.id}
                      checked={disabilities[option.id]}
                      onChange={handleCheckboxChange}
                      disabled={isSubmitting}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`${option.id}Checkbox`}
                    >
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Last row with "Others" option */}
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="othersCheckbox"
                    name="others"
                    checked={disabilities.others}
                    onChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                  <label className="form-check-label" htmlFor="othersCheckbox">
                    Others (Please specify)
                  </label>
                </div>
              </div>
            </div>

            {/* Others text input */}
            {disabilities.others && (
              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="othersTextInput"
                      value={disabilities.othersText}
                      onChange={handleOthersTextChange}
                      placeholder="Please specify"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="othersTextInput">
                      Please specify your disability
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="d-flex justify-content-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  <span role="status">Saving...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-floppy"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DisabilityForm;
