import React from "react";

const CompanyInformation = ({ company }) => {
  const companyInformation = company?.companyInformation;

  // Helper component for consistent info display
  const InfoItem = ({ label, value }) => (
    <div className="mb-3">
      <h6 className="text-muted mb-1">{label}</h6>
      <p className="mb-0">{value || "-"}</p>
    </div>
  );

  const TaxInfoItem = ({ label, value, type = "text" }) => {
    const formatValue = () => {
      if (type === "tin") return formatTIN(value);
      return value || "-";
    };

    return (
      <div className="mb-2">
        {label}: {formatValue()}
      </div>
    );
  };

  const formatTIN = (tin) => {
    if (!tin) return "-"; // Return dash if empty/null

    // Remove any existing hyphens and non-digits
    const cleaned = tin.toString().replace(/\D/g, "");

    // Format as XXX-XXX-XXX-XXX only if we have 12 digits
    if (cleaned.length === 12) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1-$2-$3-$4");
    }

    // Return raw value if not 12 digits (or handle differently if needed)
    return cleaned;
  };

  return (
    <div className="company-information">
      <div className="row">
        <div className="col-md-6">
          {/* Company Profile Section */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body text-center">
              <img
                src={companyInformation?.companyLogo}
                alt="Company Logo"
                className="img-fluid mb-3"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  border: "3px solid #f0f0f0",
                  borderRadius: "10px",
                }}
              />
              <h3 className="mb-2">{companyInformation?.businessName}</h3>
              {companyInformation?.industry && (
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  {companyInformation.industry}
                </span>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                {" "}
                <i className="bi bi-info-circle-fill"></i> About Us
              </h5>
              <p className="card-text">
                {companyInformation?.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Employer Information */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                <i className="bi bi-person-fill"></i> Employer Information
              </h5>
              <InfoItem
                label="Employer Name"
                value={companyInformation?.employerName}
              />
              <InfoItem
                label="Employer Position"
                value={companyInformation?.employerPosition}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                <i className="bi bi-geo-alt-fill"></i> Company Address
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <InfoItem
                    label="Unit No"
                    value={companyInformation?.unitNumber}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem label="Street" value={companyInformation?.street} />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Barangay"
                    value={companyInformation?.barangay}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="City/Municipality"
                    value={companyInformation?.cityMunicipality}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Province"
                    value={companyInformation?.province}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="ZIP Code"
                    value={companyInformation?.zipCode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-6">
          {/* Contact Information */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                <i className="bi bi-telephone-fill"></i> Contact Information
              </h5>
              <InfoItem
                label="Email Address"
                value={companyInformation?.emailAddress}
              />
              <InfoItem
                label="Mobile Number"
                value={companyInformation?.mobileNumber}
              />
              <InfoItem
                label="Telephone Number"
                value={companyInformation?.telephoneNumber}
              />
            </div>
          </div>

          {/* Office Details */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                <i className="bi bi-building-fill"></i> Company Details
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <InfoItem
                    label="Office Type"
                    value={companyInformation?.officeType}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Company Size"
                    value={companyInformation?.companySize}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Type of Business"
                    value={companyInformation?.typeOfBusiness}
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Industry"
                    value={companyInformation?.industry}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">Tax Information</h5>
              <TaxInfoItem
                label="TIN Number"
                value={companyInformation?.tinNumber}
                type="tin"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .company-information .card {
          border-radius: 10px;
          transition: transform 0.2s;
        }
        .company-information .card:hover {
          transform: translateY(-2px);
        }
        .company-information h5.card-title {
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default CompanyInformation;
