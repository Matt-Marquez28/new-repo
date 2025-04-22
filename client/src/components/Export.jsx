import React, { useEffect } from "react";
import { JOBSEEKER_API_END_POINT } from "../utils/constants";
import axios from "axios";

const Export = () => {
  useEffect(() => {
    exportData();
  }, []);

  const exportData = async () => {
    try {
      const response = await axios.get(
        `${JOBSEEKER_API_END_POINT}/export-single-jobseeker-data`,
        {
          responseType: "blob", // Required for binary (Excel) downloads
          withCredentials: true, // Ensures cookies/auth headers are sent
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "jobseeker_export.xlsx");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      // Optional: Show error to user (e.g., toast/alert)
    }
  };

  return <div>Preparing download...</div>;
};

export default Export;
