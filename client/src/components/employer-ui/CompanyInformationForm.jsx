import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import axios from "axios";
import { useUser } from "../../contexts/user.context";
import default_company from "../../images/default-company.jpg";

// formik validation schema
const FormSchema = Yup.object().shape({
  tinNumber: Yup.string()
    .required("TIN Number is required")
    .matches(/^\d{12}$/, "TIN Number must be exactly 12 digits"),
  businessName: Yup.string().required("Business Name is required"),
  officeType: Yup.string().required("Office Type is required"),
  companySize: Yup.string().required("Company Size is required"),
  typeOfBusiness: Yup.string().required("Type of Business is required"),
  industry: Yup.string().required("Industry is required"),
  employerName: Yup.string().required("Employer Name is required"),
  employerPosition: Yup.string().required("Employer Position is required"),
  description: Yup.string().required("Description is required"),
  unitNumber: Yup.string(),
  street: Yup.string(),
  barangay: Yup.string().required("Barangay is required"),
  cityMunicipality: Yup.string().required("City/Municipality is required"),
  province: Yup.string().required("Province is required"),
  zipCode: Yup.string()
    .required("ZIP Code is required")
    .matches(/^\d{4}$/, "ZIP Code must be 4 digits"),
  mobileNumber: Yup.string()
    .required("Mobile Number is required")
    .matches(/^\d{10,11}$/, "Mobile number must be 10-11 digits"),
  telephoneNumber: Yup.string().matches(
    /^\d{9}$/,
    "Telephone number must be 9 digits"
  ),
  emailAddress: Yup.string()
    .email("Invalid email address")
    .required("Email address is required"),
});

const CompanyInformationForm = () => {
  const { user, setUser } = useUser();
  const [companyInformation, setCompanyInformation] = useState(null);
  const triggerToast = useToast();
  const [previewUrl, setPreviewUrl] = useState(null); // State for image preview
  const isAccredited = user.companyData?.status === "accredited" ? true : false;

  useEffect(() => {
    getCompanyData();
  }, []);

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      setCompanyInformation(res?.data?.companyData?.companyInformation);
      console.log(res?.data?.companyData);
    } catch (error) {
      console.log(error);
    }
  };

  // handle file change
  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      // Create a temporary preview URL for UI
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl); // Store preview URL for UI

      // If you plan to upload later, set the file in Formik state
      setFieldValue("currentPhoto", file); // You can keep the file for form submission
    }
  };

  const industries = [
    "Business Process Outsourcing (BPO)",
    "Sales",
    "Food Service",
    "Healthcare",
    "Construction",
    "Education",
    "Information Technology (IT)",
    "Manufacturing",
    "Finance",
    "Retail",
    "Transportation and Logistics",
    "Telecommunications",
    "Real Estate",
    "Legal Services",
    "Government",
    "Agriculture",
    "Energy",
    "Tourism and Hospitality",
    "Media and Entertainment",
    "Research and Development",
    "Consulting",
    "Insurance",
    "Marketing and Advertising",
    "Human Resources",
    "Security Services",
    "Environmental Services",
    "Arts and Design",
    "Sports and Recreation",
    "Non-Profit and Social Services",
    "Science and Technology",
    "Automotive",
    "Textiles and Apparel",
    "Pharmaceuticals",
    "Aerospace",
    "Marine",
    "Mining",
    "Forestry",
    "Veterinary Services",
    "Public Relations",
    "Event Management",
    "Interior Design",
    "Architecture",
    "Education and Training",
    "Translation and Interpretation",
    "Photography and Videography",
    "Fitness and Wellness",
    "Legal and Compliance",
    "Supply Chain and Logistics",
    "Quality Assurance",
    "Customer Service",
    "Technical Support",
  ];

  return (
    <Formik
      enableReinitialize
      initialValues={{
        tinNumber: companyInformation?.tinNumber || "",
        businessName: companyInformation?.businessName || "",
        officeType: companyInformation?.officeType || "",
        companySize: companyInformation?.companySize || "",
        typeOfBusiness: companyInformation?.typeOfBusiness || "",
        industry: companyInformation?.industry || "",
        employerName: companyInformation?.employerName || "",
        employerPosition: companyInformation?.employerPosition || "",
        description: companyInformation?.description || "",
        unitNumber: companyInformation?.unitNumber || "",
        street: companyInformation?.street || "",
        barangay: companyInformation?.barangay || "",
        cityMunicipality: companyInformation?.cityMunicipality || "",
        province: companyInformation?.province || "",
        zipCode: companyInformation?.zipCode || "",
        mobileNumber: companyInformation?.mobileNumber || "",
        telephoneNumber: companyInformation?.telephoneNumber || "",
        emailAddress: companyInformation?.emailAddress || "",
        currentPhoto: companyInformation?.companyLogo || null,
      }}
      // set validation schema
      validationSchema={FormSchema}
      // formik on submit
      onSubmit={async (values) => {
        const formData = new FormData();

        // populate formData with key-value pairs
        Object.keys(values).forEach((key) => {
          if (key === "currentPhoto" && values[key]) {
            formData.append("file", values[key]);
          } else if (key !== "currentPhoto") {
            formData.append(key, values[key]);
          }
        });

        try {
          const res = await axios.post(
            `${COMPANY_API_END_POINT}/upsert`,
            formData,
            {
              withCredentials: true,
            }
          );
          triggerToast(res?.data?.message, "primary");
          setUser((prev) => ({
            ...prev, // Preserve other properties in the state
            companyData: {
              ...prev.companyData, // Preserve other properties in companyData
              companyInformation: res?.data?.company?.companyInformation,
            },
          }));
        } catch (error) {
          console.log(error?.response?.data?.message);
          triggerToast(error?.response?.data?.message, "danger");
        }
      }}
    >
      {({ setFieldValue, errors, touched }) => (
        <Form className="container mt-4">
          {/* Section Title: Company Information */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
            <div className="">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1a4798",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <i className="bi bi-building-fill text-white"></i>
                </div>
                <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                  Company Information
                </h5>
              </div>
            </div>
          </div>

          {/* Company Information Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="tinNumber">TIN Number:</label>
              <Field name="tinNumber">
                {({ field, form }) => {
                  const handleChange = (e) => {
                    // Remove all non-digit characters
                    let value = e.target.value.replace(/\D/g, "");

                    // Apply formatting (XXX-XXX-XXX-XXX)
                    if (value.length > 9) {
                      value = `${value.slice(0, 3)}-${value.slice(
                        3,
                        6
                      )}-${value.slice(6, 9)}-${value.slice(9, 12)}`;
                    } else if (value.length > 6) {
                      value = `${value.slice(0, 3)}-${value.slice(
                        3,
                        6
                      )}-${value.slice(6)}`;
                    } else if (value.length > 3) {
                      value = `${value.slice(0, 3)}-${value.slice(3)}`;
                    }

                    // Update formik field value (storing the unformatted version)
                    form.setFieldValue(
                      field.name,
                      e.target.value.replace(/\D/g, "")
                    );

                    // Return the formatted value for display
                    return value;
                  };

                  // Get the current value and format it for display
                  const displayValue = field.value
                    ? field.value.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{3})/,
                        "$1-$2-$3-$4"
                      )
                    : "";

                  return (
                    <input
                      {...field}
                      disabled={isAccredited}
                      type="text"
                      className={`form-control ${
                        touched.tinNumber &&
                        (errors.tinNumber ? "is-invalid" : "is-valid")
                      }`}
                      value={displayValue}
                      onChange={handleChange}
                      maxLength={15} // 12 digits + 3 hyphens
                    />
                  );
                }}
              </Field>
              <ErrorMessage
                component="div"
                name="tinNumber"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="businessName">Business Name:</label>
              <Field
                disabled={isAccredited}
                name="businessName"
                type="text"
                className={`form-control ${
                  touched.businessName &&
                  (errors.businessName ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="businessName"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="officeType">Office Type:</label>
              <Field
                disabled={isAccredited}
                name="officeType"
                as="select"
                className={`form-select ${
                  touched.officeType &&
                  (errors.officeType ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select an Office Type</option>
                <option value="main">Main</option>
                <option value="branch">Branch</option>
              </Field>
              <ErrorMessage
                component="div"
                name="officeType"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="companySize">Company Size:</label>
              <Field
                disabled={isAccredited}
                name="companySize"
                as="select"
                className={`form-select ${
                  touched.companySize &&
                  (errors.companySize ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select a company size</option>
                <option value="micro">Micro 1-10</option>
                <option value="small">Small 11-50</option>
                <option value="medium">Medium 51-250</option>
                <option value="large">Large 251-500</option>
              </Field>
              <ErrorMessage
                component="div"
                name="companySize"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="typeOfBusiness">Type of Business:</label>
              <Field
                disabled={isAccredited}
                name="typeOfBusiness"
                as="select"
                className={`form-select ${
                  touched.typeOfBusiness &&
                  (errors.typeOfBusiness ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select a type of business</option>
                <option value="sole proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="corporation">Corporation</option>
                <option value="cooperative">Cooperative</option>
              </Field>
              <ErrorMessage
                component="div"
                name="typeOfBusiness"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="industry">Industry:</label>
              <Field
                disabled={isAccredited}
                as="select"
                name="industry"
                className={`form-control ${
                  touched.industry &&
                  (errors.industry ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select Industry</option>
                {industries.map((industry, index) => (
                  <option key={index} value={industry}>
                    {industry}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                component="div"
                name="industry"
                className="invalid-feedback"
              />
            </div>

            <div className="col-md-12 mb-3">
              <label htmlFor="description">Description:</label>
              <Field
                name="description"
                as="textarea"
                rows="4"
                className={`form-control ${
                  touched.description &&
                  (errors.description ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="description"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/* Section Title: Employer Information */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
            <div className="">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1a4798",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <i className="bi bi-person-fill text-white"></i>
                </div>
                <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                  Employer Information
                </h5>
              </div>
            </div>
          </div>

          {/* Employer Information Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="employerName">Employer Name:</label>
              <Field
                name="employerName"
                type="text"
                className={`form-control ${
                  touched.employerName &&
                  (errors.employerName ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="employerName"
                className="invalid-feedback"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="employerPosition">Employer Position:</label>
              <Field
                name="employerPosition"
                type="text"
                className={`form-control ${
                  touched.employerPosition &&
                  (errors.employerPosition ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="employerPosition"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/* Section Title: Address Information */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
            <div className="">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1a4798",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <i className="bi bi-geo-alt-fill text-white"></i>
                </div>
                <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                  Company Address
                </h5>
              </div>
            </div>
          </div>

          {/* Address Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="unitNumber">Unit No:</label>
              <Field
                name="unitNumber"
                type="text"
                className={`form-control ${
                  touched.unitNumber &&
                  (errors.unitNumber ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="unitNumber"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="street">Street:</label>
              <Field
                name="street"
                type="text"
                className={`form-control ${
                  touched.street && (errors.street ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="street"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="barangay">Barangay:</label>
              <Field
                name="barangay"
                type="text"
                className={`form-control ${
                  touched.barangay &&
                  (errors.barangay ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="barangay"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="cityMunicipality">City/Municipality:</label>
              <Field
                name="cityMunicipality"
                type="text"
                className={`form-control ${
                  touched.cityMunicipality &&
                  (errors.cityMunicipality ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="cityMunicipality"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="province">Province:</label>
              <Field
                name="province"
                type="text"
                className={`form-control ${
                  touched.province &&
                  (errors.province ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="province"
                className="invalid-feedback"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="zipCode">ZIP Code:</label>
              <Field
                name="zipCode"
                type="text"
                className={`form-control ${
                  touched.zipCode &&
                  (errors.zipCode ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="zipCode"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/* Section Title: Contact Information */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
            <div className="">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1a4798",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <i className="bi bi-telephone-fill text-white"></i>
                </div>
                <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                  Contact Information
                </h5>
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="mobileNumber">Mobile Number:</label>
              <Field
                name="mobileNumber"
                type="text"
                className={`form-control ${
                  touched.mobileNumber &&
                  (errors.mobileNumber ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="telephoneNumber"
                className="invalid-feedback"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="telephoneNumber">Telephone Number:</label>
              <Field
                name="telephoneNumber"
                type="text"
                className={`form-control ${
                  touched.telephoneNumber &&
                  (errors.telephoneNumber ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="telephoneNumber"
                className="invalid-feedback"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="emailAddress">Email Address:</label>
              <Field
                name="emailAddress"
                type="email"
                className={`form-control ${
                  touched.emailAddress &&
                  (errors.emailAddress ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="emailAddress"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/*title:  upload picture section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
            <div className="">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#1a4798",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                  }}
                >
                  <i className="bi bi-image text-white"></i>
                </div>
                <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
                  Company Logo
                </h5>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="text-center">
                <img
                  src={
                    previewUrl ||
                    companyInformation?.companyLogo ||
                    default_company
                  }
                  alt="Profile Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                  className=" border shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="profilePicture">Company Logo:</label>
                <input
                  disabled={isAccredited}
                  id="companyLogo"
                  name="companyLogo"
                  type="file"
                  accept="image/jpeg, image/png"
                  className={`form-control ${
                    touched.companyLogo && errors.companyLogo
                      ? "is-invalid"
                      : ""
                  }`}
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
                <ErrorMessage
                  component="div"
                  name="companyLogo"
                  className="invalid-feedback"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="alert alert-warning" role="alert">
                <strong>Company Logo Guidelines:</strong>
                <ul className="mb-0">
                  <li>Accepted formats: JPG, PNG, JPEG</li>
                  <li>Maximum file size: 5 MB</li>
                  <li>Recommended dimensions: At least 500x500 pixels</li>
                  <li>Ensure the photo is clear</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-floppy"></i> Save Changes
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CompanyInformationForm;
