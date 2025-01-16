import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const ScheduleInterview = ({
  interviewDetails,
  setApplication,
  getApplication,
}) => {
  const triggerToast = useToast();
  const { applicationId } = useParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const initialValues = {
    interviewerName: interviewDetails?.interviewerName || "",
    emailAddress: interviewDetails?.emailAddress || "",
    mobileNumber: interviewDetails?.mobileNumber || "",
    interviewDate: interviewDetails?.interviewDate || "",
    interviewTime: interviewDetails?.interviewTime || "",
    interviewLocation: interviewDetails?.interviewLocation || "",
    interviewLink: interviewDetails?.interviewLink || "",
    interviewNotes: interviewDetails?.interviewNotes || "",
  };

  const validationSchema = Yup.object({
    interviewerName: Yup.string().required(
      "Please provide an interviewer name."
    ),
    emailAddress: Yup.string()
      .email("Invalid email address")
      .required("Please provide an email address."),
    mobileNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Please provide a valid mobile number.")
      .required("Please provide a mobile number."),
    interviewDate: Yup.date().required("Please provide an interview date."),
    interviewTime: Yup.string().required("Please provide an interview time."),
    interviewLocation: Yup.string().required(
      "Please provide an interview location."
    ),
  });

  const onSubmit = async (values) => {
    // Submit formData to your backend
    console.log(values);
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/schedule-interview/${applicationId}`,
        values,
        {
          withCredentials: true,
        }
      );
      setApplication((prev) => ({
        ...prev,
        ...(res?.data?.application || {}),
      }));
      triggerToast(res?.data?.message, "success");
      getApplication();
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleCancelInterview = async () => {
    try {
      const res = await axios.patch(
        `${APPLICATION_API_END_POINT}/cancel-interview/${applicationId}`,
        {},
        {
          withCredentials: true,
        }
      );
      setApplication((prev) => ({
        ...prev,
        ...(res?.data?.application || {}),
      }));
      getApplication();
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      const res = await axios.patch(
        `${APPLICATION_API_END_POINT}/mark-interview-completed/${applicationId}`,
        {},
        {
          withCredentials: true,
        }
      );
      setApplication((prev) => ({
        ...prev,
        ...(res?.data?.application || {}),
      }));
      getApplication();
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.log(error);
      triggerToast(error?.response?.data?.message, "danger");
    }
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setFormValues(values);
          setShowScheduleModal(true);
          setSubmitting(false);
        }}
      >
        {({ handleChange, values, touched, errors, isSubmitting }) => (
          <Form noValidate className="container">
            {interviewDetails ? (
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill"></i> Interview has been
                scheduled!
              </div>
            ) : (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-info-circle-fill"></i> Interview has not
                been scheduled yet
              </div>
            )}
            <div className="row">
              <div className="col-md-6">
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
                    onChange={handleChange}
                    value={values.interviewerName}
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
                    onChange={handleChange}
                    value={values.emailAddress}
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
                    onChange={handleChange}
                    value={values.mobileNumber}
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
                    onChange={handleChange}
                    value={values.interviewDate}
                  />
                  <ErrorMessage
                    component="div"
                    className="invalid-feedback"
                    name="interviewDate"
                  />
                </div>
              </div>

              <div className="col-md-6">
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
                    onChange={handleChange}
                    value={values.interviewTime}
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
                    onChange={handleChange}
                    value={values.interviewLocation}
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
                    onChange={handleChange}
                    value={values.interviewLink}
                    pattern="^(http|https):\/\/[^ ]+$" // URL validation (optional)
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
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(true)}
                disabled={!interviewDetails || isSubmitting}
              >
                <i className="bi bi-calendar2-x"></i> Cancel Interview
              </button>
              <button
                type="button"
                className="btn btn-info text-light"
                onClick={() => setShowCompleteModal(true)}
                disabled={!interviewDetails || isSubmitting}
              >
                <i className="bi bi-calendar2-check"></i> Mark as Complete
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <i className="bi bi-calendar2-event"></i> Schedule Interview
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Cancel Interview Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel this interview?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleCancelInterview();
              setShowCancelModal(false);
            }}
          >
            Cancel Interview
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mark as Complete Modal */}
      <Modal
        show={showCompleteModal}
        onHide={() => setShowCompleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Mark Interview as Complete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark this interview as complete?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCompleteModal(false)}
          >
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              handleMarkAsComplete();
              setShowCompleteModal(false);
            }}
          >
            Mark as Complete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to schedule this interview?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowScheduleModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSubmit(formValues);
              setShowScheduleModal(false);
            }}
          >
            Schedule Interview
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ScheduleInterview;
