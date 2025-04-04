import React from "react";

const CompanyInformation = ({ company }) => {
  const companyInformation = company?.companyInformation;

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          <div className="text-center mb-4">
            <img
              src={companyInformation?.companyLogo}
              alt="Profile Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
              className="border rounded shadow-sm"
            />
            <h5 className="my-2">{companyInformation?.businessName}</h5>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Description</h5>
            <p className="text-secondary small">
              {companyInformation?.description}
            </p>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Employer Information</h5>
            <div className="form-group">
              <label>Employer Name</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.employerName || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Employer Position</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.employerPosition || ""}
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Company Address</h5>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.street || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Barangay</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.barangay || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>City/Municipality</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.cityMunicipality || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.province || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.zipCode || ""}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Next Column */}
        <div className="col-md-6">
          <div className="mb-4">
            <h5 className="text-primary">Contact Information</h5>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={companyInformation?.emailAddress || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.mobileNumber || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Telephone Number</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.telephoneNumber || ""}
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Office Details</h5>
            <div className="form-group">
              <label>Office Type</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.officeType || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.companySize || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Type of Business</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.typeOfBusiness || ""}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.industry || ""}
                disabled
              />
            </div>
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Tax Information</h5>
            <div className="form-group">
              <label>TIN Number</label>
              <input
                type="text"
                className="form-control"
                value={companyInformation?.tinNumber || ""}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInformation;
