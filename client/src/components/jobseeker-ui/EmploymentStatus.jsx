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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const employmentData = res?.data?.jobSeekerData?.employmentStatus || {};

      setEmploymentStatus(employmentData?.status);

      if (employmentData?.status === "employed") {
        setEmploymentType(employmentData?.employedDetails?.employmentType);

        if (
          employmentData?.employedDetails?.employmentType === "self-employed"
        ) {
          setSelfEmploymentDetail(
            employmentData?.employedDetails?.selfEmployment?.detail
          );
          setSelfEmploymentOther(
            employmentData?.employedDetails?.selfEmployment?.otherDetail || ""
          );
        }
      }

      if (employmentData?.status === "unemployed") {
        setUnemploymentReason(employmentData?.unemployedDetails?.reason);
        setUnemploymentOtherReason(
          employmentData?.unemployedDetails?.otherReason || ""
        );
        setMonthsLookingForWork(
          employmentData?.unemployedDetails?.monthsLookingForWork || ""
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
      setIsSubmitting(true);
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-employment-status`,
        { payload },
        { withCredentials: true }
      );
      triggerToast(
        res?.data?.message || "Employment status updated successfully",
        "success"
      );
    } catch (error) {
      console.error("Update error:", error);
      triggerToast(
        error?.response?.data?.message || "Failed to update employment status",
        "error"
      );
    } finally {
      setIsSubmitting(false);
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
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative" style={{ color: "#1a4798" }}>
            <i className="bi bi-duffle-fill"></i> Employment Status
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>
      </div>

      {isLoading && !employmentStatus ? (
        <div className="d-flex justify-content-center my-5 py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Main Employment Options */}
          <div
            className="card mb-4"
            style={{ borderColor: "rgba(13, 110, 253, 0.25)" }}
          >
            <div
              className="card-header text-white"
              style={{ backgroundColor: "#1a4798" }}
            >
              <h5 className="card-title mb-0">Current Employment Status</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check card p-3 h-100 border-primary">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="employmentStatus"
                      id="employedRadio"
                      value="employed"
                      checked={employmentStatus === "employed"}
                      onChange={handleEmploymentChange}
                    />
                    <label
                      className="form-check-label fw-bold fs-5"
                      htmlFor="employedRadio"
                    >
                      <i className="bi bi-briefcase me-2"></i>Employed
                    </label>
                    {employmentStatus === "employed" && (
                      <small className="text-muted mt-1">
                        You're currently working
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check card p-3 h-100 border-primary">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="employmentStatus"
                      id="unemployedRadio"
                      value="unemployed"
                      checked={employmentStatus === "unemployed"}
                      onChange={handleEmploymentChange}
                    />
                    <label
                      className="form-check-label fw-bold fs-5"
                      htmlFor="unemployedRadio"
                    >
                      <i className="bi bi-person-x me-2"></i>Unemployed
                    </label>
                    {employmentStatus === "unemployed" && (
                      <small className="text-muted mt-1">
                        You're currently looking for work
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Type Details */}
          {employmentStatus === "employed" && (
            <div
              className="card mb-4"
              style={{ borderColor: "rgba(13, 110, 253, 0.25)" }}
            >
              <div
                className="card-header text-white"
                style={{ backgroundColor: "#1a4798" }}
              >
                <h5 className="card-title mb-0">Employment Details</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-bold mb-3">
                    Employment Type:
                  </label>
                  <div className="row g-3">
                    {employmentTypeOptions.map((option) => (
                      <div className="col-md-6" key={option.value}>
                        <div
                          className={`form-check card p-3 h-100 ${
                            employmentType === option.value
                              ? "border-primary"
                              : ""
                          }`}
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name="employmentType"
                            id={option.value}
                            value={option.value}
                            checked={employmentType === option.value}
                            onChange={(e) => setEmploymentType(e.target.value)}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor={option.value}
                          >
                            {option.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-employment details */}
                {employmentType === "self-employed" && (
                  <div className="mb-3 ps-md-4 border-start border-3 border-primary">
                    <label className="form-label fw-bold mb-3">
                      Self-employment Type:
                    </label>
                    <div className="row g-3">
                      {selfEmploymentOptions.map((type, index) => (
                        <div className="col-md-6" key={`selfEmpType-${index}`}>
                          <div
                            className={`form-check card p-3 h-100 ${
                              selfEmploymentDetail === type
                                ? "border-primary"
                                : ""
                            }`}
                          >
                            <input
                              className="form-check-input"
                              type="radio"
                              name="selfEmploymentType"
                              id={`selfEmpType${index}`}
                              value={type}
                              checked={selfEmploymentDetail === type}
                              onChange={(e) => {
                                setSelfEmploymentDetail(e.target.value);
                                if (e.target.value !== "Others") {
                                  setSelfEmploymentOther("");
                                }
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`selfEmpType${index}`}
                            >
                              {type}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selfEmploymentDetail === "Others" && (
                      <div className="mt-3">
                        <div className="form-floating">
                          <input
                            type="text"
                            className="form-control"
                            id="selfEmploymentOther"
                            value={selfEmploymentOther}
                            onChange={(e) =>
                              setSelfEmploymentOther(e.target.value)
                            }
                            placeholder="Enter your occupation"
                          />
                          <label htmlFor="selfEmploymentOther">
                            Please specify your occupation
                          </label>
                        </div>
                        <div className="form-text">
                          Describe your self-employment occupation
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unemployment Details */}
          {employmentStatus === "unemployed" && (
            <div
              className="card mb-4 "
              style={{ borderColor: "rgba(13, 110, 253, 0.25)" }}
            >
              <div
                className="card-header text-white"
                style={{ backgroundColor: "#1a4798" }}
              >
                <h5 className="card-title mb-0">Unemployment Details</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-bold mb-3">
                    Reason for unemployment:
                  </label>
                  <div className="row g-3">
                    {unemploymentReasonOptions.map((reason, index) => (
                      <div className="col-md-6" key={`reason-${index}`}>
                        <div
                          className={`form-check card p-3 h-100 ${
                            unemploymentReason === reason
                              ? "border-primary"
                              : ""
                          }`}
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name="unemploymentReason"
                            id={`reason${index + 1}`}
                            value={reason}
                            checked={unemploymentReason === reason}
                            onChange={(e) => {
                              setUnemploymentReason(e.target.value);
                              if (e.target.value !== "Others") {
                                setUnemploymentOtherReason("");
                              }
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`reason${index + 1}`}
                          >
                            {reason}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {unemploymentReason === "Others" && (
                    <div className="mt-3">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="otherReasonInput"
                          value={unemploymentOtherReason}
                          onChange={(e) =>
                            setUnemploymentOtherReason(e.target.value)
                          }
                          placeholder="Enter your reason"
                        />
                        <label htmlFor="otherReasonInput">
                          Please specify your reason
                        </label>
                      </div>
                      <div className="form-text">
                        Describe why you're currently unemployed
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="monthsLookingInput"
                    className="form-label fw-bold"
                  >
                    How long have you been looking for work?
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <div className="input-group" style={{ maxWidth: "200px" }}>
                      <input
                        type="text"
                        className="form-control"
                        id="monthsLookingInput"
                        value={monthsLookingForWork}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^[0-9\b]+$/.test(value)) {
                            setMonthsLookingForWork(value);
                          }
                        }}
                        placeholder="e.g. 6"
                      />
                      <span className="input-group-text">months</span>
                    </div>
                    <div className="form-text">
                      Enter the number of months you've been seeking employment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {employmentStatus && (
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setEmploymentStatus("");
                  setEmploymentType("");
                  setSelfEmploymentDetail("");
                  setSelfEmploymentOther("");
                  setUnemploymentReason("");
                  setUnemploymentOtherReason("");
                  setMonthsLookingForWork("");
                }}
              >
                <i className="bi bi-x-circle me-2"></i>Clear Selection
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default EmploymentStatus;
