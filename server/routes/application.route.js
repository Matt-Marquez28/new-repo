import express from "express";
import {
  applyJobVacancy,
  cancelInterview,
  declineApplicant,
  deleteApplication,
  getAllApplicants,
  getAllApplications,
  getAllEmployerApplicants,
  getApplicantStatistics,
  getApplication,
  getHiredApplicants,
  getInterviewTitles,
  hireApplicant,
  markInterviewAsCompleted,
  scheduleInterview,
  scheduleToPreviousInteview,
} from "../controllers/application.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { checkBlocked } from "../middlewares/checkBlocked.js";

const router = express.Router();

// routes
router.post(
  "/apply-job-vacancy/:jobVacancyId",
  isAuthenticated,
  checkBlocked,
  applyJobVacancy
);

router.get("/get-all-applications", isAuthenticated, getAllApplications);

router.get(
  "/get-all-employer-applicants",
  isAuthenticated,
  getAllEmployerApplicants
);

router.delete(
  "/delete-application/:jobVacancyId",
  isAuthenticated,
  deleteApplication
);

router.get("/get-application/:applicationId", getApplication);

router.post(
  "/schedule-interview/:applicationId",
  isAuthenticated,
  checkBlocked,
  scheduleInterview
);

router.post(
  "/schedule-to-previous-interview/:applicationId",
  isAuthenticated,
  scheduleToPreviousInteview
);

router.patch(
  "/cancel-interview/:applicationId",
  isAuthenticated,
  cancelInterview
);

router.get("/get-interview-titles", isAuthenticated, getInterviewTitles);

router.patch(
  "/mark-interview-completed/:applicationId",
  isAuthenticated,
  checkBlocked,
  markInterviewAsCompleted
);

router.post("/hire-applicant/:applicationId", isAuthenticated, checkBlocked, hireApplicant);

router.post("/decline-applicant/:applicationId", declineApplicant);

router.get("/get-applicant-statistics", getApplicantStatistics);

router.get("/get-hired-applicants", getHiredApplicants);

router.get("/get-all-applicants", getAllApplicants);

export default router;
