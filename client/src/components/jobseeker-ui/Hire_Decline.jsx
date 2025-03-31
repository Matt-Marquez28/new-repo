import React, { useState } from "react";

const Hire_Decline = ({ remarks, getApplication }) => {
  return (
    <div>
      <h5>Hire / Decline</h5>
      <div className="form-group mb-3">
        <label htmlFor="remarksTextArea" className="form-label">
          Remarks
        </label>
        <textarea
          id="remarksTextArea"
          className="form-control"
          rows="4"
          value={remarks}
          placeholder="View your remarks here..."
          readOnly
        ></textarea>
      </div>
    </div>
  );
};

export default Hire_Decline;
