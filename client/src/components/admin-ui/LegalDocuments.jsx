import React from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { COMPANY_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const LegalDocuments = ({
  companyId,
  onExpirationUpdate,
  getCompanyDocument,
}) => {
  const triggerToast = useToast();
  const documents = companyId;

  const formatISOToDate = (isoString) => {
    if (!isoString) return "";
    return format(parseISO(isoString), "yyyy-MM-dd");
  };

  const documentNameMap = {
    dti: "DTI Registration",
    birRegistration: "BIR Registration",
    mayorsPermit: "Mayor's Permit",
    secCertificate: "SEC Certificate",
    pagibigRegistration: "Pag-IBIG Registration",
    philhealthRegistration: "PhilHealth Registration",
    sss: "SSS Registration",
  };

  const documentKeys = [
    "dti",
    "birRegistration",
    "mayorsPermit",
    "secCertificate",
    "pagibigRegistration",
    "philhealthRegistration",
    "sss",
  ];

  const initialValues = documentKeys.reduce((acc, key) => {
    acc[key] = documents?.[key]?.expiresAt
      ? formatISOToDate(documents[key].expiresAt)
      : "";
    return acc;
  }, {});

  const validationSchema = Yup.object(
    documentKeys.reduce((schema, key) => {
      if (
        documents[key] &&
        !["sss", "philhealthRegistration", "pagibigRegistration"].includes(key)
      ) {
        schema[key] = Yup.date().required(
          `${documentNameMap[key]} is required`
        );
      }
      return schema;
    }, {})
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const expirationDates = Object.entries(values)
        .filter(
          ([key]) =>
            documents[key] &&
            !["sss", "philhealthRegistration", "pagibigRegistration"].includes(
              key
            )
        )
        .map(([key, value]) => ({
          documentType: key,
          expirationDate: value,
        }));

      if (onExpirationUpdate) {
        onExpirationUpdate(expirationDates);
      }

      try {
        const res = await axios.post(
          `${COMPANY_API_END_POINT}/update-expiration-dates`,
          {
            companyId: companyId?.companyId?._id,
            updates: expirationDates,
          }
        );
        getCompanyDocument();
        triggerToast(res?.data?.message, "success");
      } catch (error) {
        triggerToast(error?.response?.data?.message, "danger");
      }
    },
  });

  return (
    <div className="container-fluid">
      <form onSubmit={formik.handleSubmit}>
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle-fill"></i> Ensure all document
          expiration dates are updated and accurate before proceeding with
          verification.
        </div>
        <div className="row g-4">
          {documentKeys
            .filter((key) => documents[key])
            .map((key) => (
              <div key={key} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-light shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center mb-3">
                      <div className="">
                        <h5
                          className="card-title mb-1 fw-bold"
                          style={{ color: "#555555" }}
                        >
                          {documentNameMap[key]}
                        </h5>
                        <Link
                          to={documents[key]?.url}
                          className="btn btn-light text-nowrap text-info"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="bi bi-file-earmark-text-fill"></i> Open
                          Document
                        </Link>
                      </div>
                      {documents[key]?.expirationDate && (
                        <div className="col-4 text-end">
                          <span className="badge bg-info">
                            Current:{" "}
                            {formatISOToDate(documents[key].expirationDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-0">
                      <label htmlFor={key} className="form-label">
                        Update Expiration Date
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-calendar"></i>
                        </span>
                        <input
                          type="date"
                          id={key}
                          name={key}
                          value={formik.values[key]}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`form-control ${
                            formik.touched[key] && formik.errors[key]
                              ? "is-invalid"
                              : ""
                          }`}
                          style={{
                            color:
                              formik.values[key] &&
                              new Date(formik.values[key]) < new Date()
                                ? "red"
                                : "black",
                          }}
                          disabled={[
                            "sss",
                            "philhealthRegistration",
                            "pagibigRegistration",
                          ].includes(key)}
                        />
                        {formik.touched[key] && formik.errors[key] && (
                          <div className="invalid-feedback">
                            {formik.errors[key]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="text-end mt-4">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-upload"></i> Update Expiration Dates
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalDocuments;
