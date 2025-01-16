import express from "express";
import { getAllAuditTrail } from "../controllers/auditTrail.controller.js";

const router = express.Router();

// routes for clients
router.get("/get-all-audit-trail", getAllAuditTrail);

export default router;
