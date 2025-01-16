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

router.put("/update-educational-backgrounds", isAuthenticated, updateEducationalBackgrounds)

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

export default router;


