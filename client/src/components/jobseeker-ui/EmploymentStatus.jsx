import React, { useState, useEffect } from "react";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const EmploymentStatus = () => {
  const triggerToast = useToast();
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [selfEmploymentDetail, setSelfEmploymentDetail] = useState("");
  const [selfEmploymentOther, setSelfEmploymentOther] = useState("");
  const [unemploymentReason, setUnemploymentReason] = useState("");
  const [unemploymentOtherReason, setUnemploymentOtherReason] = useState("");
  const [monthsLookingForWork, setMonthsLookingForWork] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );

      // Populate employmentStatus
      setEmploymentStatus(res?.data?.jobSeekerData?.employmentStatus?.status);

      // Populate employmentType (if employed)
      if (res?.data?.jobSeekerData?.employmentStatus?.status === "employed") {
        setEmploymentType(
          res?.data?.jobSeekerData?.employmentStatus?.employedDetails
            ?.employmentType
        );

        // Populate self-employment details if employed and self-employed
        if (
          res?.data?.jobSeekerData?.employmentStatus?.employedDetails
            ?.employmentType === "self-employed"
        ) {
          setSelfEmploymentDetail(
            res?.data?.jobSeekerData?.employmentStatus?.employedDetails
              ?.selfEmployment?.detail
          );
          setSelfEmploymentOther(
            res?.data?.jobSeekerData?.employmentStatus?.employedDetails
              ?.selfEmployment?.otherDetail || ""
          );
        }
      }

      // Populate unemployment details (if unemployed)
      if (res?.data?.jobSeekerData?.employmentStatus?.status === "unemployed") {
        setUnemploymentReason(
          res?.data?.jobSeekerData?.employmentStatus?.unemployedDetails?.reason
        );
        setUnemploymentOtherReason(
          res?.data?.jobSeekerData?.employmentStatus?.unemployedDetails
            ?.otherReason || ""
        );
        setMonthsLookingForWork(
          res?.data?.jobSeekerData?.employmentStatus?.unemployedDetails
            ?.monthsLookingForWork || ""
        );
      }
    } catch (error) {
      console.error("Error fetching job seeker data:", error);
      triggerToast(
        error?.response?.data?.message || "Failed to load employment data",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employmentStatus) {
      triggerToast("Please select your employment status", "error");
      return;
    }

    if (employmentStatus === "employed" && !employmentType) {
      triggerToast("Please select your employment type", "error");
      return;
    }

    if (
      employmentStatus === "employed" &&
      employmentType === "self-employed" &&
      !selfEmploymentDetail
    ) {
      triggerToast("Please select your self-employment type", "error");
      return;
    }

    if (
      employmentStatus === "employed" &&
      employmentType === "self-employed" &&
      selfEmploymentDetail === "Others" &&
      !selfEmploymentOther.trim()
    ) {
      triggerToast("Please specify your occupation", "error");
      return;
    }

    if (employmentStatus === "unemployed" && !unemploymentReason) {
      triggerToast("Please select reason for unemployment", "error");
      return;
    }

    if (
      employmentStatus === "unemployed" &&
      unemploymentReason === "Others" &&
      !unemploymentOtherReason.trim()
    ) {
      triggerToast("Please specify your reason", "error");
      return;
    }

    if (
      employmentStatus === "unemployed" &&
      !monthsLookingForWork &&
      monthsLookingForWork !== 0
    ) {
      triggerToast("Please enter months looking for work", "error");
      return;
    }

    const payload = {
      status: employmentStatus,
    };

    if (employmentStatus === "employed") {
      payload.employedDetails = {
        employmentType,
      };

      if (employmentType === "self-employed") {
        payload.employedDetails.selfEmployment = {
          detail: selfEmploymentDetail,
        };

        if (selfEmploymentDetail === "Others") {
          payload.employedDetails.selfEmployment.otherDetail =
            selfEmploymentOther;
        }
      }
    }

    if (employmentStatus === "unemployed") {
      payload.unemployedDetails = {
        reason: unemploymentReason,
        monthsLookingForWork: Number(monthsLookingForWork),
      };

      if (unemploymentReason === "Others") {
        payload.unemployedDetails.otherReason = unemploymentOtherReason;
      }
    }

    try {
      setIsLoading(true);
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-employment-status`,
        { payload },
        { withCredentials: true }
      );
      triggerToast(res?.data?.message || "Employment status updated successfully", "success");
    } catch (error) {
      console.error("Update error:", error);
      triggerToast(
        error?.response?.data?.message || "Failed to update employment status",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmploymentChange = (e) => {
    const newStatus = e.target.value;
    setEmploymentStatus(newStatus);
    // Reset all relevant states when status changes
    if (newStatus !== "unemployed") {
      setUnemploymentReason("");
      setUnemploymentOtherReason("");
      setMonthsLookingForWork("");
    }
    if (newStatus !== "employed") {
      setEmploymentType("");
      setSelfEmploymentDetail("");
      setSelfEmploymentOther("");
    }
  };

  const handleUnemploymentReasonChange = (e) => {
    setUnemploymentReason(e.target.value);
    if (e.target.value !== "Others") {
      setUnemploymentOtherReason("");
    }
  };

  const handleUnemploymentOtherReasonChange = (e) => {
    setUnemploymentOtherReason(e.target.value);
  };

  const handleMonthsLookingChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setMonthsLookingForWork(value);
    }
  };

  const handleEmploymentTypeChange = (e) => {
    setEmploymentType(e.target.value);
    if (e.target.value !== "self-employed") {
      setSelfEmploymentDetail("");
      setSelfEmploymentOther("");
    }
  };

  const handleSelfEmploymentDetailChange = (e) => {
    setSelfEmploymentDetail(e.target.value);
    if (e.target.value !== "Others") {
      setSelfEmploymentOther("");
    }
  };

  const handleSelfEmploymentOtherChange = (e) => {
    setSelfEmploymentOther(e.target.value);
  };

  const employmentTypeOptions = [
    { value: "wage-employed", label: "Wage employed" },
    { value: "self-employed", label: "Self-employed" },
  ];

  const selfEmploymentOptions = [
    "Fisherman / Fisherfolk",
    "Vendor / Retailer",
    "Home-based worker",
    "Transport",
    "Domestic Worker",
    "Freelancer",
    "Artisan / Craft Worker",
    "Others",
  ];

  const unemploymentReasonOptions = [
    "New Entrant / Fresh Graduate",
    "Finished Contract",
    "Resigned",
    "Retired",
    "Terminated / Laid off due to calamity",
    "Terminated / Laid off (local)",
    "Terminated / Laid off (abroad)",
    "Others",
  ];

  return (
    <div className="container mt-3">
      {/* Section Header */}
      <div className="row align-items-center my-4">
        <div className="col">
          <hr className="border-2 border-primary opacity-75" />
        </div>
        <div className="col-auto">
          <h4 className="text-primary fw-bold">
            <i className="bi bi-briefcase me-2"></i>Employment Status
          </h4>
        </div>
        <div className="col">
          <hr className="border-2 border-primary opacity-75" />
        </div>
      </div>

      {isLoading && !employmentStatus ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Employment Options */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Current Employment Status</h5>
              <div className="d-flex gap-4 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="employmentStatus"
                    id="employedRadio"
                    value="employed"
                    checked={employmentStatus === "employed"}
                    onChange={handleEmploymentChange}
                  />
                  <label className="form-check-label fw-medium" htmlFor="employedRadio">
                    Employed
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="employmentStatus"
                    id="unemployedRadio"
                    value="unemployed"
                    checked={employmentStatus === "unemployed"}
                    onChange={handleEmploymentChange}
                  />
                  <label className="form-check-label fw-medium" htmlFor="unemployedRadio">
                    Unemployed
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Type Details */}
          {employmentStatus === "employed" && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Employment Details</h5>
                <div className="mb-4">
                  <label className="form-label fw-medium mb-2">Employment Type:</label>
                  <div className="d-flex flex-wrap gap-3">
                    {employmentTypeOptions.map((option) => (
                      <div className="form-check" key={option.value}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="employmentType"
                          id={option.value}
                          value={option.value}
                          checked={employmentType === option.value}
                          onChange={handleEmploymentTypeChange}
                        />
                        <label className="form-check-label" htmlFor={option.value}>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-employment details */}
                {employmentType === "self-employed" && (
                  <div className="mb-3 ps-3 border-start border-3 border-primary">
                    <label className="form-label fw-medium mb-2">Self-employment Type:</label>
                    <div className="d-flex flex-column gap-2">
                      {selfEmploymentOptions.map((type, index) => (
                        <div className="form-check" key={`selfEmpType-${index}`}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="selfEmploymentType"
                            id={`selfEmpType${index}`}
                            value={type}
                            checked={selfEmploymentDetail === type}
                            onChange={handleSelfEmploymentDetailChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`selfEmpType${index}`}
                          >
                            {type}
                          </label>
                        </div>
                      ))}

                      {selfEmploymentDetail === "Others" && (
                        <div className="mt-2 ms-4">
                          <div className="form-floating">
                            <input
                              type="text"
                              className="form-control"
                              id="selfEmploymentOther"
                              value={selfEmploymentOther}
                              onChange={handleSelfEmploymentOtherChange}
                              placeholder="Enter your occupation"
                            />
                            <label htmlFor="selfEmploymentOther">Please specify your occupation</label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unemployment Details */}
          {employmentStatus === "unemployed" && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Unemployment Details</h5>
                <div className="mb-4">
                  <label className="form-label fw-medium mb-2">Reason for unemployment:</label>
                  <div className="d-flex flex-column gap-2">
                    {unemploymentReasonOptions.map((reason, index) => (
                      <div className="form-check" key={`reason-${index}`}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="unemploymentReason"
                          id={`reason${index + 1}`}
                          value={reason}
                          checked={unemploymentReason === reason}
                          onChange={handleUnemploymentReasonChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`reason${index + 1}`}
                        >
                          {reason}
                        </label>
                      </div>
                    ))}

                    {unemploymentReason === "Others" && (
                      <div className="mt-2 ms-4">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="otherReasonInput"
                            value={unemploymentOtherReason}
                            onChange={handleUnemploymentOtherReasonChange}
                            placeholder="Enter your reason"
                          />
                          <label htmlFor="otherReasonInput">Please specify your reason</label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="monthsLookingInput" className="form-label fw-medium">
                    How long have you been looking for work? (in months)
                  </label>
                  <div className="input-group" style={{ maxWidth: "200px" }}>
                    <input
                      type="text"
                      className="form-control"
                      id="monthsLookingInput"
                      value={monthsLookingForWork}
                      onChange={handleMonthsLookingChange}
                      placeholder="e.g. 6"
                    />
                    <span className="input-group-text">months</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {employmentStatus && (
            <div className="d-flex justify-content-end mt-4">
              <button 
                className="btn btn-primary px-4 py-2" 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    <span role="status">Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmploymentStatus;