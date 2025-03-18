import express from "express";
import {
  upsertCompany,
  getCompanyData,
  uploadCompanyDocuments,
  getAllCompanyDocuments,
  getCompanyDocument,
  updateExpirationDates,
  updateAboutUs,

  getCompanyDocumentByCompanyId,
  accreditCompany,
  getAllCompanies,
  getCompanyDocumentByCompanyIdAdmin,
  declineCompany,
  getCompanyDataById,
  updateCandidatePreferences,
  getAccreditedCompanies,
  getRenewals,
} from "../controllers/company.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multerSingle.js";
import uploadMultipleFiles from "../middlewares/multerMultiple.js";

const router = express.Router();

// update or insert company information
router.post("/upsert", isAuthenticated, singleUpload, upsertCompany);

// get all companies router
router.get("/get-all-companies", getAllCompanies);

// update about us router
router.put("/update-about-us", isAuthenticated, updateAboutUs);

// get company data
router.get("/get-company-data", isAuthenticated, getCompanyData);

// get company data by id
router.get("/get-company-data-by-id/:companyId", getCompanyDataById);

// upload company documents
router.post(
  "/upload-company-documents",
  isAuthenticated,
  uploadMultipleFiles,
  uploadCompanyDocuments
);

// get all company documents
router.get("/get-all-company-documents", getAllCompanyDocuments);

// get company document (for administrator)
router.get("/get-company-document/:documentId", getCompanyDocument);

// get company document by company id (for employer)
router.get(
  "/get-company-document-by-companyId",
  isAuthenticated,
  getCompanyDocumentByCompanyId
);

router.get(
  "/get-company-document-by-companyId-admin/:companyId",
  getCompanyDocumentByCompanyIdAdmin
);

// update document expiration dates
router.post("/update-expiration-dates", updateExpirationDates);

// decline company document
// router.put("/decline-company-document", declineCompanyDocument);

// accredit company
router.patch("/accredit-company/:companyId", isAuthenticated, accreditCompany);

// decline company
router.patch("/decline-company/:companyId", isAuthenticated, declineCompany);

router.patch("/update-candidate-preferences", isAuthenticated, updateCandidatePreferences);

router.get("/get-accredited-companies", getAccreditedCompanies);

router.get("/get-renewals", getRenewals)

export default router;
