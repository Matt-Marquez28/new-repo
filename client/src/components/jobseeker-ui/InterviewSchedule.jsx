import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Alert } from "react-bootstrap";

const ScheduleInterview = ({ interviewDetails }) => {
  if (!interviewDetails) {
    return (
      <div className="text-center p-4 border rounded-3 bg-light">
      <i className="bi bi-calendar-minus fs-1 text-muted mb-3"></i>
      <p className="text-muted">No interview scheduled.</p>
    </div>
    );
  }

  const initialValues = {
    interviewerName: interviewDetails.interviewerName || "",
    emailAddress: interviewDetails.emailAddress || "",
    mobileNumber: interviewDetails.mobileNumber || "",
    interviewDate: interviewDetails.interviewDate || "",
    interviewTime: interviewDetails.interviewTime || "",
    interviewLocation: interviewDetails.interviewLocation || "",
    interviewLink: interviewDetails.interviewLink || "",
    interviewNotes: interviewDetails.interviewNotes || "",
  };

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {({ values, touched, errors }) => (
        <Form noValidate className="container">
          <div className="row">
            <div className="col-md-6">
              {/* Fields for the first column */}
              <div className="form-group mb-3">
                <label htmlFor="interviewerName">Interviewer Name</label>
                <Field
                  type="text"
                  className={`form-control ${
                    touched.interviewerName && errors.interviewerName
                      ? "is-invalid"
                      : ""
                  }`}
                  id="interviewerName"
                  name="interviewerName"
                  value={values.interviewerName}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="interviewerName"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="emailAddress">Email Address</label>
                <Field
                  type="email"
                  className={`form-control ${
                    touched.emailAddress && errors.emailAddress
                      ? "is-invalid"
                      : ""
                  }`}
                  id="emailAddress"
                  name="emailAddress"
                  value={values.emailAddress}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="emailAddress"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <Field
                  type="tel"
                  className={`form-control ${
                    touched.mobileNumber && errors.mobileNumber
                      ? "is-invalid"
                      : ""
                  }`}
                  id="mobileNumber"
                  name="mobileNumber"
                  value={values.mobileNumber}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="mobileNumber"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="interviewDate">Interview Date</label>
                <Field
                  type="date"
                  className={`form-control ${
                    touched.interviewDate && errors.interviewDate
                      ? "is-invalid"
                      : ""
                  }`}
                  id="interviewDate"
                  name="interviewDate"
                  value={values.interviewDate}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="interviewDate"
                />
              </div>
            </div>

            <div className="col-md-6">
              {/* Fields for the second column */}
              <div className="form-group mb-3">
                <label htmlFor="interviewTime">Interview Time</label>
                <Field
                  type="time"
                  className={`form-control ${
                    touched.interviewTime && errors.interviewTime
                      ? "is-invalid"
                      : ""
                  }`}
                  id="interviewTime"
                  name="interviewTime"
                  value={values.interviewTime}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="interviewTime"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="interviewLocation">Interview Location</label>
                <Field
                  type="text"
                  className={`form-control ${
                    touched.interviewLocation && errors.interviewLocation
                      ? "is-invalid"
                      : ""
                  }`}
                  id="interviewLocation"
                  name="interviewLocation"
                  value={values.interviewLocation}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="interviewLocation"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="interviewLink">
                  Interview Link (if online)
                </label>
                <Field
                  type="url"
                  className={`form-control ${
                    touched.interviewLink && errors.interviewLink
                      ? "is-invalid"
                      : ""
                  }`}
                  id="interviewLink"
                  name="interviewLink"
                  value={values.interviewLink}
                  disabled
                />
                <ErrorMessage
                  component="div"
                  className="invalid-feedback"
                  name="interviewLink"
                />
              </div>
            </div>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="interviewNotes">Interview Notes</label>
            <Field
              as="textarea"
              className="form-control"
              id="interviewNotes"
              name="interviewNotes"
              value={values.interviewNotes}
              disabled
              rows="4"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ScheduleInterview;
