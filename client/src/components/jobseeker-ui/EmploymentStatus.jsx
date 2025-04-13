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

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
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
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        monthsLookingForWork: Number(monthsLookingForWork), // convert to number
      };

      if (unemploymentReason === "Others") {
        payload.unemployedDetails.otherReason = unemploymentOtherReason;
      }
    }

    try {
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-employment-status`,
        { payload }, // important to wrap it in { payload } to match controller
        { withCredentials: true }
      );
      console.log(res?.data?.message);
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.log("Error:", error?.response?.data || error);
      triggerToast(
        error?.response?.data?.message || "An error occurred",
        "error"
      );
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
    if (e.target.value === "" || /^[0-9\b]+$/.test(e.target.value)) {
      setMonthsLookingForWork(e.target.value);
    }
  };

  const handleEmploymentTypeChange = (e) => {
    setEmploymentType(e.target.value);
    // Clear self-employment details when switching away from self-employed
    if (e.target.value !== "self-employed") {
      setSelfEmploymentDetail("");
      setSelfEmploymentOther("");
    }
  };

  const handleSelfEmploymentDetailChange = (e) => {
    setSelfEmploymentDetail(e.target.value);
    // Clear "other" field if not selecting "Others"
    if (e.target.value !== "Others") {
      setSelfEmploymentOther("");
    }
  };

  const handleSelfEmploymentOtherChange = (e) => {
    setSelfEmploymentOther(e.target.value);
  };

  // ... (other handlers remain the same)

  return (
    <div className="container mt-3">
      {/* Centered title */}
      {/* title: personal details section */}
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative text-primary">
            <i className="bi bi-file-person-fill"></i> Employment Status
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2 border-primary" />
        </div>
      </div>

      {/* Main Employment Options */}
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
          <label className="form-check-label" htmlFor="employedRadio">
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
          <label className="form-check-label" htmlFor="unemployedRadio">
            Unemployed
          </label>
        </div>
      </div>

      {/* Employment Type Details */}
      {employmentStatus === "employed" && (
        <div className="ms-4">
          <div className="mb-3">
            <p className="mb-2">Employment Type:</p>
            <div className="d-flex flex-column gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="employmentType"
                  id="wageEmployed"
                  value="wage-employed"
                  checked={employmentType === "wage-employed"}
                  onChange={handleEmploymentTypeChange}
                />
                <label className="form-check-label" htmlFor="wageEmployed">
                  Wage employed
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="employmentType"
                  id="selfEmployed"
                  value="self-employed"
                  checked={employmentType === "self-employed"}
                  onChange={handleEmploymentTypeChange}
                />
                <label className="form-check-label" htmlFor="selfEmployed">
                  Self-employed
                </label>
              </div>
            </div>
          </div>

          {/* Self-employment details */}
          {employmentType === "self-employed" && (
            <div className="ms-4 mb-3">
              <p className="mb-2">Self-employment Type:</p>
              <div className="d-flex flex-column gap-2">
                {[
                  "Fisherman / Fisherfolk",
                  "Vendor / Retailer",
                  "Home-based worker",
                  "Transport",
                  "Domestic Worker",
                  "Freelancer",
                  "Artisan / Craft Worker",
                  "Others",
                ].map((type, index) => (
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
                    <label htmlFor="selfEmploymentOther" className="form-label">
                      Please specify:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="selfEmploymentOther"
                      value={selfEmploymentOther}
                      onChange={handleSelfEmploymentOtherChange}
                      placeholder="Enter your occupation"
                      style={{ maxWidth: "300px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unemployment Details (same as before) */}
      {employmentStatus === "unemployed" && (
        <div className="ms-4">
          <div className="ms-4">
            <div className="mb-3">
              <p className="mb-2">Reason for unemployment:</p>
              <div className="d-flex flex-column gap-2">
                {[
                  "New Entrant / Fresh Graduate",
                  "Finished Contract",
                  "Resigned",
                  "Retired",
                  "Terminated / Laid off due to calamity",
                  "Terminated / Laid off (local)",
                  "Terminated / Laid off (abroad)",
                  "Others",
                ].map((reason, index) => (
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
                    <label htmlFor="otherReasonInput" className="form-label">
                      Please specify:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="otherReasonInput"
                      value={unemploymentOtherReason}
                      onChange={handleUnemploymentOtherReasonChange}
                      placeholder="Enter your reason..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="monthsLookingInput" className="form-label">
                How long have you been looking for work? (in months)
              </label>
              <input
                type="text"
                className="form-control"
                id="monthsLookingInput"
                value={monthsLookingForWork}
                onChange={handleMonthsLookingChange}
                placeholder="Enter number of months"
                style={{ maxWidth: "150px" }}
              />
            </div>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" onClick={handleSubmit}>
          <i className="bi bi-floppy"></i> Save Changes
        </button>
      </div>
    </div>
  );
};

export default EmploymentStatus;
