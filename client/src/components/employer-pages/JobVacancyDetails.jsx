import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useToast } from "../../contexts/toast.context";
import Footer from "../shared-ui/Footer";
import { useNavigate } from "react-router-dom";

// validation schema
const jobVacancyValidationSchema = Yup.object().shape({
  jobTitle: Yup.string().required("Job title is required"),
  employmentType: Yup.string()
    .oneOf(
      ["permanent", "part-time", "temporary", "contractual"],
      "Invalid employment type"
    )
    .required("Employment type is required"),
  workLocation: Yup.string().required("Work location is required"),
  vacancies: Yup.number()
    .required("Number of vacancies is required")
    .min(1, "Vacancies must be at least 1"),
  salaryType: Yup.string()
    .oneOf(["hourly", "monthly"], "Invalid salary type")
    .required("Salary type is required"),
  salaryMin: Yup.number()
    .required("Minimum salary is required")
    .min(0, "Minimum salary must be at least 0"),
  salaryMax: Yup.number()
    .required("Maximum salary is required")
    .moreThan(
      Yup.ref("salaryMin"),
      "Maximum salary must be greater than minimum salary"
    ),
  description: Yup.string().required("Description is required"),
  industry: Yup.string().required("Industry is required"),
  requiredQualifications: Yup.array()
    .of(Yup.string().required("Qualification is required"))
    .min(1, "At least one qualification is required"),
  responsibilities: Yup.array()
    .of(Yup.string().required("Responsibility is required"))
    .min(1, "At least one responsibility is required"),
  skillsRequired: Yup.array()
    .of(Yup.string().required("Skill is required"))
    .min(1, "At least one skill is required"),
  applicationDeadline: Yup.date()
    .required("Application deadline is required")
    .nullable(false),
  interviewProcess: Yup.string().required("Interview process is required"),
});

const industryOptions = [
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

const JobVacancyDetails = () => {
  const navigate = useNavigate();
  const { jobVacancyId } = useParams();
  const [jobVacancy, setJobVacancy] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const triggerToast = useToast();
  const isVerified =
    jobVacancy?.publicationStatus === "approved" ? true : false;

  // format date
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // formik initial values
  const initialValues = {
    jobTitle: jobVacancy?.jobTitle || "",
    employmentType: jobVacancy?.employmentType || "",
    workLocation: jobVacancy?.workLocation || "",
    vacancies: jobVacancy?.vacancies || null,
    salaryType: jobVacancy?.salaryType || "",
    salaryMin: jobVacancy?.salaryMin || null,
    salaryMax: jobVacancy?.salaryMax || null,
    description: jobVacancy?.description || "",
    industry: jobVacancy?.industry || "",
    educationalLevel: jobVacancy?.educationalLevel || "",
    requiredQualifications: jobVacancy?.requiredQualifications || [""],
    responsibilities: jobVacancy?.responsibilities || [""],
    skillsRequired: jobVacancy?.skillsRequired || [""],
    applicationDeadline: formatDate(jobVacancy?.applicationDeadline) || "",
    interviewProcess: jobVacancy?.interviewProcess || "",
  };

  // useEffect to get the job vacancy
  useEffect(() => {
    fetchJobVacancyDetails();
  }, []);

  // get single job vacancy function
  const fetchJobVacancyDetails = async () => {
    try {
      const res = await axios.get(
        `${JOB_VACANCY_API_END_POINT}/get-single-job-vacancy/${jobVacancyId}`
      );
      setJobVacancy(res.data.jobVacancy);
      console.log(res?.data?.jobVacancy);
    } catch (err) {
      setError(err.message);
    }
  };

  // handle modals
  const handleShowArchiveModal = () => setShowArchiveModal(true);
  const handleCloseArchiveModal = () => setShowArchiveModal(false);
  const handleShowUnarchiveModal = () => setShowUnarchiveModal(true);
  const handleCloseUnarchiveModal = () => setShowUnarchiveModal(false);

  // handle confirm archive
  const handleConfirmArchive = async () => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${JOB_VACANCY_API_END_POINT}/archive-job-vacancy/${jobVacancyId}`
      );
      setJobVacancy(res.data.jobVacancy);
      setLoading(false);
      console.log(res?.data?.message);
      handleCloseArchiveModal();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // handle confirm unarchive
  const handleConfirmUnarchive = async () => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${JOB_VACANCY_API_END_POINT}/unarchive-job-vacancy/${jobVacancyId}`
      );
      setJobVacancy(res.data.jobVacancy);
      setLoading(false);
      console.log(res?.data?.message);
      handleCloseUnarchiveModal();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* buttons */}
      <div className="d-flex justify-content-between my-2">
        <button onClick={() => navigate(-1)} className="btn btn-light">
        <i class="bi bi-arrow-left"></i>
        </button>
        {jobVacancy?.status === "archived" ? (
          <Button variant="success" onClick={handleShowUnarchiveModal}>
            Unarchive
          </Button>
        ) : (
          <Button variant="danger" onClick={handleShowArchiveModal}>
            Archive
          </Button>
        )}
      </div>

      {/* Modal for archiving */}
      <Modal show={showArchiveModal} onHide={handleCloseArchiveModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-archive-fill text-danger fs-4"></i> Archive this
            Job Vacancy?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to archive this job vacancy?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseArchiveModal}>
            <i className="bi bi-file-earmark-x"></i> Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmArchive}
            disabled={loading}
          >
            {loading ? (
              "Archiving..."
            ) : (
              <>
                <i className="bi bi-archive"></i> Archive
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for unarchiving */}
      <Modal
        show={showUnarchiveModal}
        onHide={handleCloseUnarchiveModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-arrow-up-circle-fill text-success fs-4"></i>{" "}
            Unarchive this Job Vacancy?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to unarchive this job vacancy?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUnarchiveModal}>
            <i className="bi bi-file-earmark-x"></i> Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmUnarchive}
            disabled={loading}
          >
            {loading ? (
              "Unarchiving..."
            ) : (
              <>
                <i className="bi bi-arrow-up-circle"></i> Unarchive
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="card shadow-sm">
        <span className="card-header bg-primary text-light text-center">
          <i className="bi bi-info-circle"></i> Job Vacancy Details
        </span>
        <div className="card-body">
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={jobVacancyValidationSchema}
            onSubmit={async (values) => {
              console.log(values);
              try {
                const res = await axios.put(
                  `${JOB_VACANCY_API_END_POINT}/update-job-vacancy/${jobVacancyId}`,
                  values
                );
                console.log(res?.data?.message);
                triggerToast(res?.data?.message, "success");
              } catch (error) {
                console.log(error?.response?.data?.message);
                triggerToast(error?.response?.data?.message, "danger");
              }
            }}
          >
            {({ values, touched, errors }) => (
              <Form>
                <div className="row align-items-center my-3">
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                  <div className="col-auto">
                    <h5 className="position-relative text-primary">
                      <i className="bi bi-suitcase-lg-fill"></i> Job Detail
                    </h5>
                  </div>
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                </div>
                <div className="row">
                  {/* Job Title */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="jobTitle">Job Title:</label>
                    <Field
                      readOnly={isVerified}
                      name="jobTitle"
                      type="text"
                      placeholder="Enter job title"
                      className={`form-control ${
                        touched.jobTitle &&
                        (errors.jobTitle ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="jobTitle"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Employment Type */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="employmentType">Employment Type:</label>
                    <Field
                      name="employmentType"
                      as="select"
                      className={`form-select ${
                        touched.employmentType &&
                        (errors.employmentType ? "is-invalid" : "is-valid")
                      }`}
                    >
                      <option value="">Select employment type</option>
                      <option value="permanent">Permanent</option>
                      <option value="part-time">Part-Time</option>
                      <option value="temporary">Temporary</option>
                      <option value="contractual">Contractual</option>
                    </Field>
                    <ErrorMessage
                      name="employmentType"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Work Location */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="workLocation">Work Location:</label>
                    <Field
                      name="workLocation"
                      type="text"
                      placeholder="Enter work location"
                      className={`form-control ${
                        touched.workLocation &&
                        (errors.workLocation ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="workLocation"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Number of Vacancies */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="vacancies">No. of Vacancies:</label>
                    <Field
                      name="vacancies"
                      type="number"
                      placeholder="Enter number of vacancies"
                      className={`form-control ${
                        touched.vacancies &&
                        (errors.vacancies ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="vacancies"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Industry */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="industry">Industry:</label>
                    <Field
                      name="industry"
                      as="select"
                      className={`form-select ${
                        touched.industry &&
                        (errors.industry ? "is-invalid" : "is-valid")
                      }`}
                    >
                      <option value="">Select industry</option>
                      {industryOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="industry"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label htmlFor="description">Job Description:</label>
                    <Field
                      readOnly={isVerified}
                      name="description"
                      as="textarea"
                      rows="3"
                      placeholder="Enter job description"
                      className={`form-control ${
                        touched.description &&
                        (errors.description ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>

                <div className="row align-items-center my-3">
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                  <div className="col-auto">
                    <h5 className="position-relative text-primary">
                      <i className="bi bi-wallet-fill"></i> Salary Field
                    </h5>
                  </div>
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                </div>

                {/* Salary Fields */}

                {/* Salary Type */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="salaryType">Salary Type:</label>
                    <Field
                      name="salaryType"
                      as="select"
                      className={`form-select ${
                        touched.salaryType &&
                        (errors.salaryType ? "is-invalid" : "is-valid")
                      }`}
                    >
                      <option value="">Select salary type</option>
                      <option value="hourly">Hourly</option>
                      <option value="monthly">Monthly</option>
                    </Field>
                    <ErrorMessage
                      name="salaryType"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>

                {/* Minimum Salary */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="salaryMin">Minimum Salary:</label>
                    <Field
                      name="salaryMin"
                      type="number"
                      placeholder="Enter minimum salary"
                      className={`form-control ${
                        touched.salaryMin &&
                        (errors.salaryMin ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="salaryMin"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>

                {/* Maximum Salary */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="salaryMax">Maximum Salary:</label>
                    <Field
                      name="salaryMax"
                      type="number"
                      placeholder="Enter maximum salary"
                      className={`form-control ${
                        touched.salaryMax &&
                        (errors.salaryMax ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="salaryMax"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>

                <div className="row align-items-center my-3">
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                  <div className="col-auto">
                    <h5 className="position-relative text-primary">
                      <i className="bi bi-wallet-fill"></i> Job Specification
                    </h5>
                  </div>
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                </div>

                {/* Required Qualifications */}
                <FieldArray name="requiredQualifications">
                  {({ push, remove }) => (
                    <div className="mb-3">
                      <label>Required Qualifications:</label>
                      {values.requiredQualifications.map((_, index) => (
                        <div key={index} className="input-group mb-2">
                          <Field
                            name={`requiredQualifications[${index}]`}
                            as="textarea"
                            rows="1"
                            placeholder="Enter required qualification"
                            className={`form-control ${
                              touched.requiredQualifications?.[index] &&
                              (errors.requiredQualifications?.[index]
                                ? "is-invalid"
                                : "is-valid")
                            }`}
                          />
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => remove(index)}
                            disabled={
                              values.requiredQualifications.length === 1
                            }
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() => push("")}
                      >
                        <i className="bi bi-plus-circle"></i> Add More Field
                      </button>
                    </div>
                  )}
                </FieldArray>

                {/* Responsibilities */}
                <FieldArray name="responsibilities">
                  {({ push, remove }) => (
                    <div className="mb-3">
                      <label>Responsibilities:</label>
                      {values.responsibilities.map((_, index) => (
                        <div key={index} className="input-group mb-2">
                          <Field
                            name={`responsibilities[${index}]`}
                            as="textarea"
                            rows="1"
                            placeholder="Enter responsibility"
                            className={`form-control ${
                              touched.responsibilities?.[index] &&
                              (errors.responsibilities?.[index]
                                ? "is-invalid"
                                : "is-valid")
                            }`}
                          />
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => remove(index)}
                            disabled={values.responsibilities.length === 1}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() => push("")}
                      >
                        <i className="bi bi-plus-circle"></i> Add More Field
                      </button>
                    </div>
                  )}
                </FieldArray>

                {/* Skills Required */}
                <FieldArray name="skillsRequired">
                  {({ push, remove }) => (
                    <div className="mb-3">
                      <label>Skills Required:</label>
                      {values.skillsRequired.map((_, index) => (
                        <div key={index} className="input-group mb-2">
                          <Field
                            name={`skillsRequired[${index}]`}
                            as="textarea"
                            rows="1"
                            placeholder="Enter skill"
                            className={`form-control ${
                              touched.skillsRequired?.[index] &&
                              (errors.skillsRequired?.[index]
                                ? "is-invalid"
                                : "is-valid")
                            }`}
                          />
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => remove(index)}
                            disabled={values.skillsRequired.length === 1}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() => push("")}
                      >
                        <i className="bi bi-plus-circle"></i> Add More Field
                      </button>
                    </div>
                  )}
                </FieldArray>

                <div className="row align-items-center my-3">
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                  <div className="col-auto">
                    <h5 className="position-relative text-primary">
                      <i className="bi bi-suitcase-lg-fill"></i> Additional Info
                    </h5>
                  </div>
                  <div className="col">
                    <hr className="border-2 border-primary" />
                  </div>
                </div>

                <div className="row">
                  {/* Application Deadline */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="applicationDeadline">
                      Application Deadline:
                    </label>
                    <Field
                      name="applicationDeadline"
                      type="date"
                      className={`form-control ${
                        touched.applicationDeadline &&
                        (errors.applicationDeadline ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="applicationDeadline"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  {/* Interview Process */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="interviewProcess">Interview Process:</label>
                    <Field
                      name="interviewProcess"
                      type="text"
                      placeholder="Enter interview process"
                      className={`form-control ${
                        touched.interviewProcess &&
                        (errors.interviewProcess ? "is-invalid" : "is-valid")
                      }`}
                    />
                    <ErrorMessage
                      name="interviewProcess"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary mt-3">
                    <i className="bi bi-send"></i> Update Job Vacancy
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <Footer />
    </div>
  );
};

export default JobVacancyDetails;
