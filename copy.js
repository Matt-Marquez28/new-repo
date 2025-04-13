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
        <label className="form-check-label" htmlFor={`reason${index + 1}`}>
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