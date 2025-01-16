import React, { useState, useEffect } from "react";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";

const Accreditation = () => {
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState(null);
  const pdfUrl = companyData?.accreditation;

  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      setCompanyData(res?.data?.companyData);
      setError(null);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch company data. Please try again later.");
    }
  };

  return (
    <div>
      <iframe
        src={pdfUrl}
        width="100%"
        height="1000px"
        title="Accreditation PDF"
        style={{ border: "none", borderRadius: "8px", marginBottom: "16px" }}
      />
    </div>
  );
};

export default Accreditation;
