import express from "express";
import {
  postJobVacancy,
  getAllJobVacancies,
  getSingleJobVacancy,
  searchJobVacancies,
  saveJobVacancy,
  deleteSavedJobVancancy,
  getAllEmployerJobVacancies,
  getRecommendedJobVacancies,
  getAllSavedJobVacancies,
  getAllJobVacanciesAdmin,
  approveJobVacancy,
  declineJobVacancy,
  archiveJobVacancy,
  unarchiveJobVacancy,
  sendJobInvitation,
  getAllEmployerJobInvitations,
  getAllJobSeekerJobInvitations,
  deleteJobInvitation,
  updateJobVacancy,
  getAllEmployerJobVacanciesByCompanyId,
} from "../controllers/jobVacancy.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAccredited } from "../middlewares/isAccredited.js";
import { checkBlocked } from "../middlewares/checkBlocked.js";

const router = express.Router();

// routes
router.post("/post-job-vacancy", isAuthenticated, isAccredited, checkBlocked, postJobVacancy);
router.get("/get-all-job-vacancies", getAllJobVacancies);
router.get(
  "/get-all-employer-job-vacancies",
  isAuthenticated,
  getAllEmployerJobVacancies
);
router.get(
  "/get-all-employer-job-vacancies-by-company-id/:companyId",
  getAllEmployerJobVacanciesByCompanyId
);
router.get("/get-single-job-vacancy/:jobVacancyId", getSingleJobVacancy);
router.get("/search", searchJobVacancies);
router.post("/save-job-vacancy/:jobVacancyId", isAuthenticated, saveJobVacancy);
router.delete(
  "/delete-saved-job-vacancy/:jobVacancyId",
  isAuthenticated,
  deleteSavedJobVancancy
);
router.get(
  "/get-all-saved-job-vacancies",
  isAuthenticated,
  getAllSavedJobVacancies
);
router.post("/get-recommended-job-vacancies", getRecommendedJobVacancies);
router.get("/get-all-job-vacancies-admin", getAllJobVacanciesAdmin);
router.patch(
  "/approve-job-vacancy/:jobVacancyId",
  isAuthenticated,
  approveJobVacancy
);
router.patch(
  "/decline-job-vacancy/:jobVacancyId",
  isAuthenticated,
  declineJobVacancy
);
router.patch("/archive-job-vacancy/:jobVacancyId", archiveJobVacancy);
router.patch("/unarchive-job-vacancy/:jobVacancyId", unarchiveJobVacancy);
router.post(
  "/send-job-invitation/:jobSeekerId",
  isAuthenticated,
  isAccredited,
  checkBlocked,
  sendJobInvitation
);
router.get(
  "/get-all-employer-job-invitations",
  isAuthenticated,
  getAllEmployerJobInvitations
);
router.get(
  "/get-all-jobseeker-job-invitations",
  isAuthenticated,
  getAllJobSeekerJobInvitations
);
router.delete("/delete-job-invitation/:invitationId", deleteJobInvitation);
router.put("/update-job-vacancy/:jobVacancyId", updateJobVacancy);

export default router;
