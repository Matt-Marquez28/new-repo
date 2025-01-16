import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/db.js";
import accountRoute from "./routes/account.route.js";
import companyRoute from "./routes/company.route.js";
import jobVacancyRoute from "./routes/jobVacancy.route.js";
import applicationRoute from "./routes/application.route.js";
import jobSeekerRoute from "./routes/jobSeeker.route.js";
import auditTrailRoute from "./routes/auditTrail.route.js";
import sgMail from "@sendgrid/mail";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cron from "node-cron";
import JobVacancy from "./models/jobVacancy.model.js";
import CompanyDocuments from "./models/companyDocuments.model.js";
import Company from "./models/company.model.js";
import pdf from "pdf-creator-node"; // PDF generation library

// Express app setup
const app = express();
const PORT = process.env.PORT || 8000;

// Load environment variables
dotenv.config();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOption = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOption));

// API routes
app.use("/api/v1/account", accountRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job-vacancy", jobVacancyRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/jobseeker", jobSeekerRoute);
app.use("/api/v1/audit-trail", auditTrailRoute);

// Start the server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at PORT: ${PORT}`);
});

const checkAndMarkGracePeriodDocuments = async (now, gracePeriodDate) => {
  try {
    // Find documents that are within the grace period (expire within the next 30 days)
    const gracePeriodDocuments = await CompanyDocuments.find({
      $or: [
        { "dti.expiresAt": { $gt: now, $lte: gracePeriodDate } },
        { "mayorsPermit.expiresAt": { $gt: now, $lte: gracePeriodDate } },
        { "birRegistration.expiresAt": { $gt: now, $lte: gracePeriodDate } },
        { "secCertificate.expiresAt": { $gt: now, $lte: gracePeriodDate } },
        {
          "pagibigRegistration.expiresAt": { $gt: now, $lte: gracePeriodDate },
        },
        {
          "philhealthRegistration.expiresAt": {
            $gt: now,
            $lte: gracePeriodDate,
          },
        },
        { "sss.expiresAt": { $gt: now, $lte: gracePeriodDate } },
      ],
      status: { $ne: "expired" },
    });

    // Update the gracePeriod flag of documents
    if (gracePeriodDocuments.length > 0) {
      await CompanyDocuments.updateMany(
        {
          _id: { $in: gracePeriodDocuments.map((doc) => doc._id) },
        },
        {
          $set: { gracePeriod: true },
        }
      );

      console.log(
        `Marked ${gracePeriodDocuments.length} documents as within the grace period.`
      );
    } else {
      console.log("No documents found within the grace period.");
    }
  } catch (error) {
    console.error("Error while marking grace period documents:", error);
  }
};

const checkAndExpireDocuments = async (now) => {
  try {
    // Find documents where any of the specific documents have expired
    const expiredDocuments = await CompanyDocuments.find({
      $or: [
        { "dti.expiresAt": { $lte: now } },
        { "mayorsPermit.expiresAt": { $lte: now } },
        { "birRegistration.expiresAt": { $lte: now } },
        { "secCertificate.expiresAt": { $lte: now } },
        { "pagibigRegistration.expiresAt": { $lte: now } },
        { "philhealthRegistration.expiresAt": { $lte: now } },
        { "sss.expiresAt": { $lte: now } },
      ],
      status: { $ne: "expired" },
    });

    // Update status of expired documents and corresponding companies
    if (expiredDocuments.length > 0) {
      const expiredCompanyIds = expiredDocuments.map((doc) => doc.companyId);

      await CompanyDocuments.updateMany(
        {
          _id: { $in: expiredDocuments.map((doc) => doc._id) },
        },
        {
          status: "expired",
        }
      );

      await Company.updateMany(
        {
          _id: { $in: expiredCompanyIds },
        },
        {
          $set: {
            status: "revoked", // Revoke the company status
            accreditation: null, // Remove the accreditation field
            accreditationId: null, // Remove the accreditation field
            accreditationDate: null, // Remove the accreditation field
          },
        }
      );

      console.log(
        `Marked ${expiredDocuments.length} documents and ${expiredCompanyIds.length} companies as "expired".`
      );
    } else {
      console.log("No expired documents or companies found.");
    }
  } catch (error) {
    console.error(
      "Error while updating expired documents and companies:",
      error
    );
  }
};

const checkAndExpireJobVacancies = async (now) => {
  try {
    const result = await JobVacancy.updateMany(
      { applicationDeadline: { $lt: now }, status: { $ne: "expired" } },
      { $set: { status: "expired" } }
    );

    console.log(`${result.modifiedCount} job vacancies marked as expired.`);
  } catch (error) {
    console.error("Error updating expired job vacancies:", error);
  }
};

// Schedule the cron job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running the daily cron job...");

  const now = new Date();
  const gracePeriodDate = new Date(now);
  gracePeriodDate.setDate(now.getDate() + 30);

  await checkAndMarkGracePeriodDocuments(now, gracePeriodDate);
  await checkAndExpireDocuments(now);
  await checkAndExpireJobVacancies(now);
});
