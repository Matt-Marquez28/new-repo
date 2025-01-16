import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const RequiredDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [jobSeekerDocuments, setJobSeekerDocuments] = useState(null);
  const triggerToast = useToast();

  useEffect(() => {
    getJobSeekerDocuments();
  }, []);

  const getJobSeekerDocuments = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-documents`,
        {
          withCredentials: true,
        }
      );
      console.log(res?.data?.jobSeekerDocuments);
      setJobSeekerDocuments(res?.data?.jobSeekerDocuments);
    } catch (error) {
      console.log(error);
    }
  };

  const initialValues = {
    validID1: null,
    validID2: null,
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true); // Set loading to true
      const formData = new FormData();

      // Append the files to the FormData object
      if (values.validID1) formData.append("validID1", values.validID1);
      if (values.validID2) formData.append("validID2", values.validID2);

      const res = await axios.post(
        `${JOBSEEKER_API_END_POINT}/upload-required-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        getJobSeekerDocuments();
        triggerToast(res?.data?.message, "primary");
      }
    } catch (error) {
      console.error(error);
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "incomplete":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-exclamation-circle-fill text-secondary"></i>{" "}
            Incomplete
          </span>
        );
      case "pending":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-hourglass-split text-warning"></i> Pending
          </span>
        );
      case "verified":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-check-circle-fill text-success"></i> Verified
          </span>
        );
      case "declined":
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-x-circle-fill text-danger"></i> Declined
          </span>
        );
      default: {
        return (
          <span className="badge badge-light text-secondary fs-6 align-items-center">
            <i className="bi bi-exclamation-circle-fill text-secondary"></i>{" "}
            Incomplete
          </span>
        );
      }
    }
  };

  return (
    <div>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ setFieldValue, values }) => (
          <Form>
            <div className="row">
              <div className="col-md-6">
                <div className="alert alert-info p-2" role="alert">
                  Accepted formats: JPG, PNG, PDF <br />
                  Maximum file size: 5MB <br />
                  Ensure the ID is clearly visible and not expired
                </div>

                <div className="mb-3">
                  <label htmlFor="validID1">
                    Valid ID 1:{" "}
                    {jobSeekerDocuments?.validId1OriginalName ? (
                      <a
                        href={jobSeekerDocuments.validId1}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {jobSeekerDocuments.validId1OriginalName}
                      </a>
                    ) : (
                      "No file uploaded"
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="validID1"
                    onChange={(event) => {
                      setFieldValue("validID1", event.currentTarget.files[0]);
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="validID2">
                    Valid ID 2:{" "}
                    {jobSeekerDocuments?.validId2OriginalName ? (
                      <a
                        href={jobSeekerDocuments.validId2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {jobSeekerDocuments.validId2OriginalName}
                      </a>
                    ) : (
                      "No file uploaded"
                    )}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="validID2"
                    onChange={(event) => {
                      setFieldValue("validID2", event.currentTarget.files[0]);
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    List of Acceptable Valid IDs
                  </h5>
                  <ul className="text-secondary">
                    <li>Driver's License</li>
                    <li>Passport</li>
                    <li>Social Security System (SSS) ID</li>
                    <li>Philippine Identification (PhilID)</li>
                    <li>Unified Multi-Purpose ID (UMID)</li>
                    <li>Voter's ID</li>
                    <li>Postal ID</li>
                    <li>TIN (Taxpayer Identification Number) ID</li>
                    <li>Senior Citizen ID</li>
                    <li>Person with Disability (PWD) ID</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
              {getStatusBadge(jobSeekerDocuments?.status)}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-grow spinner-grow-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i> Submit Documents
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RequiredDocuments;
