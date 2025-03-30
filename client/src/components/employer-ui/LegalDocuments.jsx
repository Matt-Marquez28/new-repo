import React, { useState, useEffect } from "react";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import axios from "axios";
import { useToast } from "../../contexts/toast.context";
import { Link } from "react-router-dom";

const LegalDocuments = () => {
  const [documents, setDocuments] = useState(null);
  const [company, setCompany] = useState(null);
  const typeOfBusiness = company?.companyInformation?.typeOfBusiness;
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const triggerToast = useToast();
  const [files, setFiles] = useState({
    dti: null,
    mayorsPermit: null,
    birRegistration: null,
    secCertificate: null,
    pagibigRegistration: null,
    philhealthRegistration: null,
    sss: null,
  });

  useEffect(() => {
    getCompanyData();
    getCompanyDocumentByCompanyId();
  }, []);

  const getCompanyDocumentByCompanyId = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_END_POINT}/get-company-document-by-companyId`,
        {
          withCredentials: true,
        }
      );
      console.log(res?.data?.documents);
      setDocuments(res?.data?.documents);
    } catch (error) {
      console.log(error);
    }
  };

  const getCompanyData = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_END_POINT}/get-company-data`, {
        withCredentials: true,
      });
      console.log(res?.data?.companyData);
      setCompany(res?.data?.companyData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (event, key) => {
    setFiles({ ...files, [key]: event.target.files[0] });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key]);
      }
    });

    formData.append("typeOfBusiness", typeOfBusiness);

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/upload-company-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        console.log("Documents uploaded successfully");
        triggerToast(res?.data?.message, "primary");
        getCompanyDocumentByCompanyId();
      }
    } catch (error) {
      console.error("Error:", error);
      triggerToast(error?.response?.data?.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-light text-warning fs-6">
              <i className="bi bi-hourglass-split"></i> Pending
            </span>
          </span>
        );
      case "verified":
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-light text-success fs-6">
              <i className="bi bi-check-circle-fill"></i> Verified
            </span>
          </span>
        );
      case "declined":
        return (
          <span className="fw-semibold">
            <span className="badge bg-light text-danger fs-6">
              <i className="bi bi-x-circle-fill"></i> Declined
            </span>
          </span>
        );
      case "expired":
        return (
          <span className="fw-semibold">
            <span className="badge bg-light text-danger fs-6">
              <i className="bi bi-hourglass-bottom"></i> Expired
            </span>
          </span>
        );
      default:
        return (
          <span className="fw-semibold text-secondary">
            <span className="badge bg-secondary">Unknown</span>
          </span>
        );
    }
  };

  const isDisabled =
    documents?.status === "verified" && !documents?.gracePeriod;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="alert alert-warning" role="alert">
          Accepted formats: JPG, PNG, PDF, Maximum file size: 5MB, Ensure the
          documents is clearly visible and not expired.
        </div>
        <div className="d-flex justify-content-end mb-2">
          {getStatus(documents?.status)}
        </div>

        <div className="row">
          {typeOfBusiness === "sole proprietorship" ? (
            <div className="col-md-4 mb-3">
              <div className="rounded shadow-sm p-3">
                <label htmlFor="dti" className="form-label">
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    DTI
                  </h5>
                  <Link
                    to={documents?.dti?.url}
                    className="btn btn-light text-nowrap text-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-file-earmark-text-fill"></i> Open
                    Document
                  </Link>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="dti"
                  name="dti"
                  onChange={(event) => handleFileChange(event, "dti")}
                  disabled={isDisabled}
                />
                {documents?.dti?.expiresAt && (
                  <span
                    style={{
                      color: isExpired(documents?.dti?.expiresAt)
                        ? "red"
                        : "black",
                      display: "block",
                      marginTop: "5px",
                    }}
                  >
                    Expires on: {formatDate(documents?.dti?.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="col-md-4 mb-3">
            <div className="rounded shadow-sm p-3">
              <label htmlFor="mayorsPermit" className="form-label">
                <h5 className="fw-bold" style={{ color: "#555555" }}>
                  Mayor's Business Permit
                </h5>
                <Link
                  to={documents?.mayorsPermit?.url}
                  className="btn btn-light text-nowrap text-info"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-file-earmark-text-fill"></i> Open Document
                </Link>
              </label>
              <input
                type="file"
                className="form-control"
                id="mayorsPermit"
                name="mayorsPermit"
                onChange={(event) => handleFileChange(event, "mayorsPermit")}
                disabled={isDisabled}
              />
              {documents?.mayorsPermit?.expiresAt && (
                <span
                  style={{
                    color: isExpired(documents?.mayorsPermit?.expiresAt)
                      ? "red"
                      : "black",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Expires on: {formatDate(documents?.mayorsPermit?.expiresAt)}
                </span>
              )}
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="rounded shadow-sm p-3">
              <label htmlFor="birRegistration" className="form-label">
                <h5 className="fw-bold" style={{ color: "#555555" }}>
                  BIR Registration
                </h5>
                <Link
                  to={documents?.birRegistration?.url}
                  className="btn btn-light text-nowrap text-info"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-file-earmark-text-fill"></i> Open Document
                </Link>
              </label>
              <input
                type="file"
                className="form-control"
                id="birRegistration"
                name="birRegistration"
                onChange={(event) => handleFileChange(event, "birRegistration")}
                disabled={isDisabled}
              />
              {documents?.birRegistration?.expiresAt && (
                <span
                  style={{
                    color: isExpired(documents?.birRegistration?.expiresAt)
                      ? "red"
                      : "black",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Expires on:{" "}
                  {formatDate(documents?.birRegistration?.expiresAt)}
                </span>
              )}
            </div>
          </div>

          {typeOfBusiness === "sole proprietorship" ? null : (
            <div className="col-md-4 mb-3">
              <div className="rounded shadow-sm p-3">
                <label htmlFor="secCertificate" className="form-label">
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    SEC Certificate
                  </h5>
                  <Link
                    to={documents?.secCertificate?.url}
                    className="btn btn-light text-nowrap text-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-file-earmark-text-fill"></i> Open
                    Document
                  </Link>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="secCertificate"
                  name="secCertificate"
                  onChange={(event) =>
                    handleFileChange(event, "secCertificate")
                  }
                  disabled={isDisabled}
                />
                {documents?.secCertificate?.expiresAt && (
                  <span
                    style={{
                      color: isExpired(documents?.secCertificate?.expiresAt)
                        ? "red"
                        : "black",
                    }}
                  >
                    Expires on:{" "}
                    {formatDate(documents?.secCertificate?.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          )}

          {typeOfBusiness === "sole proprietorship" ? null : (
            <div className="col-md-4 mb-3">
              <div className="rounded shadow-sm p-3">
                <label htmlFor="pagibigRegistration" className="form-label">
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    Pag-IBIG Fund Registration
                  </h5>
                  <Link
                    to={documents?.pagibigRegistration?.url}
                    className="btn btn-light text-nowrap text-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-file-earmark-text-fill"></i> Open
                    Document
                  </Link>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="pagibigRegistration"
                  name="pagibigRegistration"
                  onChange={(event) =>
                    handleFileChange(event, "pagibigRegistration")
                  }
                  disabled={isDisabled}
                />
                {documents?.pagibigRegistration?.expiresAt && (
                  <span
                    style={{
                      color: isExpired(
                        documents?.pagibigRegistration?.expiresAt
                      )
                        ? "red"
                        : "black",
                    }}
                  >
                    Expires on:{" "}
                    {formatDate(documents?.pagibigRegistration?.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          )}

          {typeOfBusiness === "sole proprietorship" ? null : (
            <div className="col-md-4 mb-3">
              <div className="rounded shadow-sm p-3">
                <label htmlFor="philhealthRegistration" className="form-label">
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    PhilHealth Registration
                  </h5>
                  <Link
                    to={documents?.philhealthRegistration?.url}
                    className="btn btn-light text-nowrap text-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-file-earmark-text-fill"></i> Open
                    Document
                  </Link>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="philhealthRegistration"
                  name="philhealthRegistration"
                  onChange={(event) =>
                    handleFileChange(event, "philhealthRegistration")
                  }
                  disabled={isDisabled}
                />
                {documents?.philhealthRegistration?.expiresAt && (
                  <span
                    style={{
                      color: isExpired(
                        documents?.philhealthRegistration?.expiresAt
                      )
                        ? "red"
                        : "black",
                    }}
                  >
                    Expires on:{" "}
                    {formatDate(documents?.philhealthRegistration?.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          )}

          {typeOfBusiness === "sole proprietorship" ? null : (
            <div className="col-md-4 mb-3">
              <div className="rounded shadow-sm p-3">
                <label htmlFor="sss" className="form-label">
                  <h5 className="fw-bold" style={{ color: "#555555" }}>
                    SSS
                  </h5>
                  <Link
                    to={documents?.sss?.url}
                    className="btn btn-light text-nowrap text-info"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-file-earmark-text-fill"></i> Open
                    Document
                  </Link>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="sss"
                  name="sss"
                  onChange={(event) => handleFileChange(event, "sss")}
                  disabled={isDisabled}
                />
                {documents?.sss?.expiresAt && (
                  <span
                    style={{
                      color: isExpired(documents?.sss?.expiresAt)
                        ? "red"
                        : "black",
                    }}
                  >
                    Expires on: {formatDate(documents?.sss?.expiresAt)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="remarks" className="form-label">
            Remarks
          </label>
          <textarea
            className="form-control"
            id="remarks"
            name="remarks"
            rows="4"
            placeholder="View remarks here..."
            value={documents?.remarks}
            disabled
          ></textarea>
        </div>
        <div className="d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting} // Disable button when loading
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-grow spinner-grow-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-check"></i> Submit Documents
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalDocuments;
