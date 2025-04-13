import React from "react";

const Accreditation = ({ companyId }) => {
  const pdfUrl = companyId?.accreditation; // Assuming this is the Cloudinary PDF URL

  if (!pdfUrl) {
    return <div>No accreditation available.</div>;
  }

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
