import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const DisabilityForm = ({ initialData, jobSeekerId }) => {
  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );
      console.log(res?.data?.jobSeekerData?.disability);
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
      console.log(error);
    }
  };

  const triggerToast = useToast();
  const disabilityOptions = [
    { id: "none", label: "None" },
    { id: "visual", label: "Visual" },
    { id: "speech", label: "Speech" },
    { id: "mental", label: "Mental" },
    { id: "hearing", label: "Hearing" },
    { id: "physical", label: "Physical" },
    { id: "others", label: "Others (Please specify)" },
  ];

  // Initialize state with initialData if provided
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
  const [error, setError] = useState(null);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    // If "None" is checked, uncheck all other options
    if (name === "none" && checked) {
      const newState = { ...disabilities };
      Object.keys(newState).forEach((key) => {
        if (key !== "none" && key !== "othersText") {
          newState[key] = false;
        }
      });
      newState.none = true;
      setDisabilities(newState);
      return;
    }

    // If any other option is checked, uncheck "None"
    const newState = {
      ...disabilities,
      [name]: checked,
      none: name !== "none" && checked ? false : disabilities.none,
    };
    setDisabilities(newState);
  };

  const handleOthersTextChange = (e) => {
    setDisabilities({
      ...disabilities,
      othersText: e.target.value,
    });
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
      setError(null);

      const payload = preparePayload();

      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-disability`, // Adjust this endpoint as needed
        { payload },
        {
          withCredentials: true,
        }
      );
      console.log("Update successful:", res.data);
      triggerToast(res?.data?.message, "success");
    } catch (err) {
      console.error("Update failed:", err);
      triggerToast(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative text-primary">
            <i className="bi bi-file-person-fill"></i> Disability
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>
      <p className="text-muted mb-4">Please select all that apply:</p>

      {disabilityOptions.map((option) => (
        <div key={option.id} className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id={`${option.id}Checkbox`}
            name={option.id}
            checked={disabilities[option.id]}
            onChange={handleCheckboxChange}
            disabled={isSubmitting}
          />
          <label className="form-check-label" htmlFor={`${option.id}Checkbox`}>
            {option.label}
          </label>
          {option.id === "others" && disabilities.others && (
            <div className="mt-2 ms-4">
              <input
                type="text"
                className="form-control"
                value={disabilities.othersText}
                onChange={handleOthersTextChange}
                placeholder="Please specify"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      ))}

      <div className="d-flex justify-content-end">
        <button
          className="btn btn-primary mt-3"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <i className="bi bi-floppy"></i>{" "}
          {isSubmitting ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default DisabilityForm;
