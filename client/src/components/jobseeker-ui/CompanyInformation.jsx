import React from "react";

const CompanyInformation = ({ company }) => {
  const companyInformation = company?.companyInformation;
  const aboutUs = company?.aboutUs;

  // Helper component for consistent info display
  const InfoItem = ({ label, value, icon }) => (
    <div className="d-flex align-items-center gap-3 mb-3">
      <div className="bg-white p-2 rounded border">
        <i className={`bi bi-${icon} fs-5`} style={{ color: "#1a4798" }}></i>
      </div>
      <div>
        <div className="fw-semibold small text-muted">{label}</div>
        <div className="small">{value || "-"}</div>
      </div>
    </div>
  );

  const formatTIN = (tin) => {
    if (!tin) return "-";
    const cleaned = tin.toString().replace(/\D/g, "");
    if (cleaned.length === 12) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1-$2-$3-$4");
    }
    return cleaned;
  };

  return (
    <div className="card">
      <div
        className="card-header text-white text-center"
        style={{ backgroundColor: "#1a4798" }}
      >
        <div className="d-flex align-items-center justify-content-center">
          <i className="bi bi-building me-2"></i>
          <h5 className="m-0">Company Profile</h5>
        </div>
      </div>

      <div className="card-body p-4">
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-md-4">
            {/* Company Profile Section */}
            <div className="card mb-4 text-center p-3">
              {companyInformation?.companyLogo && (
                <div className="mb-3">
                  <img
                    src={companyInformation.companyLogo}
                    alt="Company Logo"
                    className="border rounded shadow-sm"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <h5 className="m-0" style={{ color: "#1a4798" }}>
                {companyInformation?.businessName}
              </h5>
              {companyInformation?.industry && (
                <div className="text-center">
                  <span
                    className="badge mt-2"
                    style={{
                      backgroundColor: "rgba(26, 71, 152, 0.1)",
                      color: "#1a4798",
                      display: "inline-block",
                      borderRadius: "0.25rem",
                      padding: "0.25rem 0.5rem",
                    }}
                  >
                    {companyInformation.industry}
                  </span>
                </div>
              )}
            </div>

            {/* Employer Information */}
            <div className="card p-3 mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-person-badge-fill"></i>
                Employer Information
              </h5>
              <InfoItem
                label="Employer Name"
                value={companyInformation?.employerName}
                icon="person-fill"
              />
              <InfoItem
                label="Employer Position"
                value={companyInformation?.employerPosition}
                icon="briefcase-fill"
              />
            </div>

            {/* Contact Information */}
            <div className="card p-3 mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-telephone-fill"></i>
                Contact Information
              </h5>
              <InfoItem
                label="Email Address"
                value={companyInformation?.emailAddress}
                icon="envelope-fill"
              />
              <InfoItem
                label="Mobile Number"
                value={companyInformation?.mobileNumber}
                icon="phone-fill"
              />
              {companyInformation?.telephoneNumber && (
                <InfoItem
                  label="Telephone Number"
                  value={companyInformation?.telephoneNumber}
                  icon="telephone-fill"
                />
              )}
            </div>

            {/* Social Media Links */}
            {(aboutUs?.companyWebsite ||
              aboutUs?.facebook ||
              aboutUs?.instagram ||
              aboutUs?.twitter) && (
              <div className="card p-3 mb-4">
                <h5
                  className="d-flex align-items-center gap-2 mb-3"
                  style={{ color: "#1a4798" }}
                >
                  <i className="bi bi-globe"></i>
                  Social Media
                </h5>
                {aboutUs?.companyWebsite && (
                  <InfoItem
                    label="Website"
                    value={
                      <a
                        href={aboutUs.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {aboutUs.companyWebsite}
                      </a>
                    }
                    icon="globe"
                  />
                )}
                {aboutUs?.facebook && (
                  <InfoItem
                    label="Facebook"
                    value={
                      <a
                        href={aboutUs.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {aboutUs.facebook}
                      </a>
                    }
                    icon="facebook"
                  />
                )}
                {aboutUs?.instagram && (
                  <InfoItem
                    label="Instagram"
                    value={
                      <a
                        href={aboutUs.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {aboutUs.instagram}
                      </a>
                    }
                    icon="instagram"
                  />
                )}
                {aboutUs?.twitter && (
                  <InfoItem
                    label="Twitter"
                    value={
                      <a
                        href={aboutUs.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {aboutUs.twitter}
                      </a>
                    }
                    icon="twitter"
                  />
                )}
              </div>
            )}

            {/* Tax Information */}
            <div className="card p-3">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-file-earmark-text-fill"></i>
                Tax Information
              </h5>
              <InfoItem
                label="TIN Number"
                value={formatTIN(companyInformation?.tinNumber)}
                icon="file-earmark-lock-fill"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-8">
            {/* About Us */}
            <div className="card mb-4 p-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-info-circle-fill"></i>
                About Us
              </h5>
              <p className="mb-0 text-secondary small">
                {companyInformation?.description || "No description provided."}
              </p>
            </div>

            {/* Mission, Vision, Goals, Values */}
            {(aboutUs?.mission ||
              aboutUs?.vision ||
              aboutUs?.goals ||
              aboutUs?.values) && (
              <div className="card mb-4 p-4">
                <h5
                  className="d-flex align-items-center gap-2 mb-3"
                  style={{ color: "#1a4798" }}
                >
                  <i className="bi bi-bullseye"></i>
                  Core Values
                </h5>
                <div className="row">
                  {aboutUs?.mission && (
                    <div className="col-md-6 mb-3">
                      <h6 className="fw-semibold" style={{ color: "#1a4798" }}>
                        <i className="bi bi-send-fill me-2"></i>Mission
                      </h6>
                      <p className="small text-secondary">{aboutUs.mission}</p>
                    </div>
                  )}
                  {aboutUs?.vision && (
                    <div className="col-md-6 mb-3">
                      <h6 className="fw-semibold" style={{ color: "#1a4798" }}>
                        <i className="bi bi-eye-fill me-2"></i>Vision
                      </h6>
                      <p className="small text-secondary">{aboutUs.vision}</p>
                    </div>
                  )}
                  {aboutUs?.goals && (
                    <div className="col-md-6 mb-3">
                      <h6 className="fw-semibold" style={{ color: "#1a4798" }}>
                        <i className="bi bi-flag-fill me-2"></i>Goals
                      </h6>
                      <p className="small text-secondary">{aboutUs.goals}</p>
                    </div>
                  )}
                  {aboutUs?.values && (
                    <div className="col-md-6 mb-3">
                      <h6 className="fw-semibold" style={{ color: "#1a4798" }}>
                        <i className="bi bi-heart-fill me-2"></i>Values
                      </h6>
                      <p className="small text-secondary">{aboutUs.values}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Address */}
            <div className="card mb-4 p-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-geo-alt-fill"></i>
                Company Address
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <InfoItem
                    label="Unit No"
                    value={companyInformation?.unitNumber}
                    icon="house-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Street"
                    value={companyInformation?.street}
                    icon="signpost-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Barangay"
                    value={companyInformation?.barangay}
                    icon="pin-map-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="City/Municipality"
                    value={companyInformation?.cityMunicipality}
                    icon="building-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Province"
                    value={companyInformation?.province}
                    icon="globe-americas"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="ZIP Code"
                    value={companyInformation?.zipCode}
                    icon="mailbox"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="card p-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-building-fill"></i>
                Company Details
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <InfoItem
                    label="Office Type"
                    value={companyInformation?.officeType}
                    icon="house-door-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Company Size"
                    value={companyInformation?.companySize}
                    icon="people-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Type of Business"
                    value={companyInformation?.typeOfBusiness}
                    icon="briefcase-fill"
                  />
                </div>
                <div className="col-md-6">
                  <InfoItem
                    label="Industry"
                    value={companyInformation?.industry}
                    icon="building-fill"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInformation;
