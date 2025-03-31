import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useUser } from "../../contexts/user.context";
import { Card } from "react-bootstrap";

// form validation schema
const FormSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  middleName: Yup.string().optional(),
  gender: Yup.string().required("Gender is required"),
  civilStatus: Yup.string().required("Civil status is required"),
  birthDate: Yup.date().required("Birth date is required"),
  educationalLevel: Yup.string().required("Educational level is required"),
  street: Yup.string().required("Street is required"),
  barangay: Yup.string().required("Barangay is required"),
  cityMunicipality: Yup.string().required("City/Municipality is required"),
  province: Yup.string().required("Province is required"),
  zipCode: Yup.string()
    .required("ZIP Code is required")
    .matches(/^\d{4}$/, "ZIP Code must be 4 digits"),
  emailAddress: Yup.string()
    .email("Invalid email address")
    .required("Email address is required"),
  mobileNumber: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d{10,11}$/, "Mobile number must be 10-11 digits"),
  aboutMe: Yup.string(),
});

const PersonalInformationForm = () => {
  const { setUser } = useUser();
  const triggerToast = useToast();
  const [personalInformation, setPersonalInformation] = useState(null);

  // useEffect to get the jobseeker data
  useEffect(() => {
    getJobSeekerData();
  }, []);

  // get job seeker data using axios
  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );
      console.log(res?.data?.jobSeekerData);
      setPersonalInformation(res?.data?.jobSeekerData?.personalInformation);
    } catch (error) {
      console.log(error?.respose?.data?.message);
    }
  };

  const [previewUrl, setPreviewUrl] = useState(null); // State for image preview

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

  return (
    <Formik
      enableReinitialize
      // initial values
      initialValues={{
        firstName: personalInformation?.firstName || "",
        lastName: personalInformation?.lastName || "",
        middleName: personalInformation?.middleName || "",
        suffix: personalInformation?.suffix || "",
        gender: personalInformation?.gender || "",
        civilStatus: personalInformation?.civilStatus || "",
        birthDate: personalInformation?.birthDate
          ? new Date(personalInformation.birthDate).toISOString().split("T")[0]
          : "",
        educationalLevel: personalInformation?.educationalLevel || "",
        street: personalInformation?.street || "",
        barangay: personalInformation?.barangay || "",
        cityMunicipality: personalInformation?.cityMunicipality || "",
        province: personalInformation?.province || "",
        zipCode: personalInformation?.zipCode || "",
        emailAddress: personalInformation?.emailAddress || "",
        mobileNumber: personalInformation?.mobileNumber || "",
        currentPhoto: personalInformation?.currentPhoto || null,
        aboutMe: personalInformation?.aboutMe || "",
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
          const res = await axios.put(
            `${JOBSEEKER_API_END_POINT}/update-personal-information`,
            formData,
            { withCredentials: true }
          );
          getJobSeekerData();
          setUser((prev) => ({
            ...prev,
            profileData: {
              ...prev.profileData,
              personalInformation: res?.data?.personalInformation,
            },
          }));
          triggerToast(res?.data?.message, "primary");
        } catch (error) {
          console.log(error?.response?.data?.message);
          triggerToast(error?.response?.data?.message, "danger");
        }
      }}
    >
      {({ setFieldValue, errors, touched }) => (
        <Form className="container mt-3">
          {/* title: personal details section */}
          <div className="row align-items-center my-3">
            {/* Left side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>

            {/* Centered title */}
            <div className="col-auto">
              <h5 className="position-relative text-primary">
                <i className="bi bi-file-person-fill"></i> Personal Details
              </h5>
            </div>

            {/* Right side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
          </div>

          <div className="row">
            {/* first name */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="firstName">First Name:</label>
              <Field
                name="firstName"
                type="text"
                className={`form-control ${
                  touched.firstName &&
                  (errors.firstName ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="firstName"
                className="invalid-feedback"
              />
            </div>

            {/* last name */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="lastName">Last Name:</label>
              <Field
                name="lastName"
                type="text"
                className={`form-control ${
                  touched.lastName &&
                  (errors.lastName ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="lastName"
                className="invalid-feedback"
              />
            </div>

            {/* middle name */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="middleName">Middle Name (optional):</label>
              <Field
                name="middleName"
                type="text"
                className={`form-control ${
                  touched.middleName &&
                  (errors.middleName ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="middleName"
                className="invalid-feedback"
              />
            </div>

            {/* suffix */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="suffix">Suffix (optional):</label>
              <Field
                name="suffix"
                type="text"
                className={`form-control ${
                  touched.suffix && (errors.suffix ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="suffix"
                className="invalid-feedback"
              />
            </div>

            {/* gender */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="gender">Gender:</label>
              <Field
                name="gender"
                as="select"
                className={`form-select ${
                  touched.gender && (errors.gender ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage
                component="div"
                name="gender"
                className="invalid-feedback"
              />
            </div>

            {/* civil status */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="civilStatus">Civil Status:</label>
              <Field
                name="civilStatus"
                as="select"
                className={`form-select ${
                  touched.civilStatus &&
                  (errors.civilStatus ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </Field>
              <ErrorMessage
                component="div"
                name="civilStatus"
                className="invalid-feedback"
              />
            </div>

            {/* birthDate */}
            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="birthDate">Birth Date:</label>
              <Field
                name="birthDate"
                type="date"
                className={`form-control ${
                  touched.birthDate &&
                  (errors.birthDate ? "is-invalid" : "is-valid")
                }`}
              />
              <ErrorMessage
                component="div"
                name="birthDate"
                className="invalid-feedback"
              />
            </div>

            <div className="col-12 col-sm-6 col-md-4 mb-2">
              <label htmlFor="educationalLevel">Educational Level:</label>
              <Field
                name="educationalLevel"
                as="select"
                className={`form-select ${
                  touched.educationalLevel &&
                  (errors.educationalLevel ? "is-invalid" : "is-valid")
                }`}
              >
                <option value="">Select Educational Level</option>
                <option value="No Formal Education">No Formal Education</option>
                <option value="Some High School (No Diploma)">
                  Some High School (No Diploma)
                </option>
                <option value="High School Graduate (Diploma)">
                  High School Graduate (Diploma)
                </option>
                <option value="Some College (No Degree)">
                  Some College (No Degree)
                </option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctoral or Professional Degree">
                  Doctoral or Professional Degree
                </option>
                <option value="Post-Doctoral Studies">
                  Post-Doctoral Studies
                </option>
              </Field>
              <ErrorMessage
                component="div"
                name="educationalLevel"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/* title: address information section */}
          <div className="row align-items-center my-3">
            {/* Left side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
            {/* Centered title */}
            <div className="col-auto">
              <h5 className="position-relative text-primary">
                <i className="bi bi-geo-alt-fill"></i> Address Information
              </h5>
            </div>

            {/* Right side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
          </div>
          <div className="row">
            {/* street */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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

            {/* barangay */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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

            {/* city/municipality */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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

            {/* province */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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

            {/* zip code */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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
          {/* contact section title */}
          <div className="row align-items-center my-3">
            {/* Left side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>

            {/* Centered title */}
            <div className="col-auto">
              <h5 className="position-relative text-primary">
                <i className="bi bi-telephone-fill"></i> Contact Information
              </h5>
            </div>

            {/* Right side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
          </div>
          <div className="row">
            {/* email address */}
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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

          {/* mobile number */}
          <div className="row mb-4">
            <div className="col-12 col-sm-6 col-md-6 mb-2">
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
                name="mobileNumber"
                className="invalid-feedback"
              />
            </div>
          </div>

          {/* about me */}
          <div className="row align-items-center my-3">
            {/* Left side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>

            {/* Centered title */}
            <div className="col-auto">
              <h5 className="position-relative text-primary">
                <i className="bi bi-info-circle-fill"></i> About Me
              </h5>
            </div>

            {/* Right side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="aboutMe">Tell more about yourself:</label>
            <Field
              name="aboutMe"
              as="textarea"
              rows={5}
              className={`form-control ${
                touched.aboutMe && (errors.aboutMe ? "is-invalid" : "is-valid")
              }`}
            />
            <ErrorMessage
              component="div"
              name="aboutMe"
              className="invalid-feedback"
            />
          </div>

          {/*title:  upload picture section */}
          <div className="row align-items-center my-3">
            {/* Left side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>

            {/* Centered title */}
            <div className="col-auto">
              <h5 className="position-relative text-primary">
                <i className="bi bi-image"></i> Upload Picture
              </h5>
            </div>

            {/* Right side of the horizontal line */}
            <div className="col">
              <hr className="border-2 border-primary" />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="text-center">
                <img
                  src={previewUrl ? previewUrl : personalInformation?.photo}
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
                <label htmlFor="currentPhoto">Profile Picture:</label>
                <input
                  id="currentPhoto"
                  name="currentPhoto"
                  type="file"
                  accept="image/jpeg, image/png"
                  className={`form-control ${
                    touched.currentPhoto && errors.currentPhoto
                      ? "is-invalid"
                      : ""
                  }`}
                  onChange={(e) => handleImageChange(e, setFieldValue)}
                />
                <ErrorMessage
                  component="div"
                  name="currentPhoto"
                  className="invalid-feedback"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="alert alert-warning" role="alert">
                <strong>Profile Picture Guidelines:</strong>
                <ul className="mb-0">
                  <li>Accepted formats: JPG, PNG, JPEG</li>
                  <li>Maximum file size: 5 MB</li>
                  <li>Recommended dimensions: At least 500x500 pixels</li>
                  <li>Ensure the photo clearly shows your face</li>
                  <li>Avoid using filters or heavily edited photos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary">
              <i className="bi bi-arrow-counterclockwise"></i> Reset
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-floppy"></i> Save Changes
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PersonalInformationForm;
