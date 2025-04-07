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
              <h5 className="card-title text-primary mb-3">About Us</h5>
              <p className="card-text">
                {companyInformation?.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Employer Information */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">
                Employer Information
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
              <h5 className="card-title text-primary mb-3">Company Address</h5>
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
                Contact Information
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
              <h5 className="card-title text-primary mb-3">Company Details</h5>
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
              <InfoItem
                label="TIN Number"
                value={companyInformation?.tinNumber}
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
