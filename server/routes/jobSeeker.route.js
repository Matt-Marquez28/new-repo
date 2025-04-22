import express from "express";
import {
  getJobSeekerData,
  updatePersonalInformation,
  updateJobPreferences,
  addEducationalBackground,
  addWorkExperience,
  updateSkillsAndSpecializations,
  uploadRequiredDocuments,
  getJobSeekerDocuments,
  getAllJobSeekerDocuments,
  getJobSeekerDocument,
  getAllJobSeekers,
  searchJobSeekers,
  getJobSeekerDataById,
  recommendCandidates,
  updateEducationalBackgrounds,
  updateWorkExperiences,
  updateEmploymentStatus,
  updateDisability,
  updateLanguages,
  updateEligibility,
  updateProfessionalLicense,
  deleteEligibility,
  deleteProfessionalLicense,
  getAllEligibilitiesAndLicenses,
  addTraining,
  getAllTrainings,
  deleteTraining,
  editTraining,
  exportSingleJobSeekerToExcel,
  checkProfileCompleteness,
} from "../controllers/jobSeeker.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multerSingle.js";
import uploadMultipleFiles from "../middlewares/multerMultiple.js";

const router = express.Router();

// get all job seeker data routes
router.get("/get-jobseeker-data", isAuthenticated, getJobSeekerData);

// get all job seekers
router.get("/get-all-jobseekers", getAllJobSeekers);

// update personal information routes
router.put(
  "/update-personal-information",
  isAuthenticated,
  singleUpload,
  updatePersonalInformation
);

// update job preferences routes
router.put("/update-job-preferences", isAuthenticated, updateJobPreferences);

// add educational background routes
router.put(
  "/add-educational-background",
  isAuthenticated,
  uploadMultipleFiles,
  addEducationalBackground
);

router.put(
  "/update-educational-backgrounds",
  isAuthenticated,
  updateEducationalBackgrounds
);

router.put("/update-work-experiences", isAuthenticated, updateWorkExperiences);

// add work experience routes
router.put(
  "/add-work-experience",
  isAuthenticated,
  uploadMultipleFiles,
  addWorkExperience
);

// update skills and specializations
router.put(
  "/update-skills-and-specializations",
  isAuthenticated,
  updateSkillsAndSpecializations
);

router.post(
  "/upload-required-documents",
  isAuthenticated,
  uploadMultipleFiles,
  uploadRequiredDocuments
);

router.get("/get-jobseeker-documents", isAuthenticated, getJobSeekerDocuments);

router.get("/get-all-jobseeker-documents", getAllJobSeekerDocuments);

router.get("/get-jobseeker-document/:documentId", getJobSeekerDocument);

router.get("/search-job-seekers", searchJobSeekers);

router.get("/get-jobseeker-data-by-id/:jobSeekerId", getJobSeekerDataById);

router.post("/recommended-candidates", recommendCandidates);

router.put(
  "/update-employment-status",
  isAuthenticated,
  updateEmploymentStatus
);

router.put("/update-disability", isAuthenticated, updateDisability);

router.put("/update-languages", isAuthenticated, updateLanguages);

router.put("/update-eligibility", isAuthenticated, updateEligibility);

router.delete(
  "/delete-eligibility/:eligibilityId",
  isAuthenticated,
  deleteEligibility
);

router.put(
  "/update-professional-license",
  isAuthenticated,
  updateProfessionalLicense
);

router.delete(
  "/delete-professional-license/:licenseId",
  isAuthenticated,
  deleteProfessionalLicense
);

router.get(
  "/get-all-eligibilities-and-licenses",
  isAuthenticated,
  getAllEligibilitiesAndLicenses
);

router.put("/add-training", isAuthenticated, addTraining);

router.get("/get-all-trainings", isAuthenticated, getAllTrainings);

router.delete("/delete-training/:trainingId", isAuthenticated, deleteTraining);

router.put("/edit-training/:trainingId", isAuthenticated, editTraining);

router.get(
  "/export-single-jobseeker-data",
  isAuthenticated,
  exportSingleJobSeekerToExcel
);

router.get(
  "/check-profile-completeness",
  isAuthenticated,
  checkProfileCompleteness
);

export default router;
