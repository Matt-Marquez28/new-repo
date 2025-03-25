import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ReportModal from "./ReportModal";
import axios from "axios";
import { ACCOUNT_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const ReportButton = ({ accountId }) => {
  const [modalShow, setModalShow] = useState(false);
  const triggerToast = useToast();

  const handleReportSubmit = async (reportData) => {
    console.log("Function called", reportData);
    try {
      console.log("trying to request");

      const response = await fetch(`${ACCOUNT_API_END_POINT}/report-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) throw new Error(data.message || "Request failed");

      triggerToast(data.message || "Report submitted successfully", "primary");
    } catch (error) {
      console.error("Report failed:", error);
      triggerToast(error.message || "Failed to submit report.", "danger");
    }
  };

  return (
    <div>
      {/* Report Button to Open Modal */}
      <Button variant="danger" onClick={() => setModalShow(true)}>
        Report
      </Button>

      {/* Report Modal Component */}
      <ReportModal
        accountId={accountId}
        show={modalShow}
        handleClose={() => setModalShow(false)}
        handleSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default ReportButton;
