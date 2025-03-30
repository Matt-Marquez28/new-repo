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
import notificationRoute from "./routes/notification.route.js";
import http from "http"; // Import HTTP module
import { Server } from "socket.io"; // Import Socket.IO
import cron from "node-cron";
import CompanyDocuments from "./models/companyDocuments.model.js";
import JobVacancy from "./models/jobVacancy.model.js";
import Company from "./models/company.model.js";
import { createNotification } from "./utils/notification.js";
import { sendEmail } from "./utils/email.js";

// Load environment variables
dotenv.config();

// Express app setup
const app = express();
const PORT = process.env.PORT || 8000;

// Create an HTTP server for Socket.IO
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://new-repo-client.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000", "https://new-repo-client.onrender.com"],
  credentials: true,
};
app.use(cors(corsOptions));

// API routes
app.use("/api/v1/account", accountRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job-vacancy", jobVacancyRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/jobseeker", jobSeekerRoute);
app.use("/api/v1/audit-trail", auditTrailRoute);
app.use("/api/v1/notification", notificationRoute);

// track connected users in sockets
const userSocketMap = {};

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Get userId from the frontend (Socket handshake query)
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id; //  Store user socket ID
  }

  console.log("Updated active users:", userSocketMap); //  Debugging

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId]; //  Remove user on disconnect
    }
    console.log("Updated active users after disconnect:", userSocketMap);
  });
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  connectDB();
  console.log(`Server running at PORT: ${PORT}`);
});

// const checkAndMarkGracePeriodDocuments = async (now, gracePeriodDate) => {
//   try {
//     // Find documents that are within the grace period (expire within the next 30 days)
//     const gracePeriodDocuments = await CompanyDocuments.find({
//       $or: [
//         { "dti.expiresAt": { $gt: now, $lte: gracePeriodDate } },
//         { "mayorsPermit.expiresAt": { $gt: now, $lte: gracePeriodDate } },
//         { "birRegistration.expiresAt": { $gt: now, $lte: gracePeriodDate } },
//         { "secCertificate.expiresAt": { $gt: now, $lte: gracePeriodDate } },
//         {
//           "pagibigRegistration.expiresAt": { $gt: now, $lte: gracePeriodDate },
//         },
//         {
//           "philhealthRegistration.expiresAt": {
//             $gt: now,
//             $lte: gracePeriodDate,
//           },
//         },
//         { "sss.expiresAt": { $gt: now, $lte: gracePeriodDate } },
//       ],
//       status: { $ne: "expired" },
//     });

//     // Update the gracePeriod flag of documents
//     if (gracePeriodDocuments.length > 0) {
//       await CompanyDocuments.updateMany(
//         {
//           _id: { $in: gracePeriodDocuments.map((doc) => doc._id) },
//         },
//         {
//           $set: { gracePeriod: true },
//         }
//       );

//       console.log(
//         `Marked ${gracePeriodDocuments.length} documents as within the grace period.`
//       );
//     } else {
//       console.log("No documents found within the grace period.");
//     }
//   } catch (error) {
//     console.error("Error while marking grace period documents:", error);
//   }
// };

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
    }).populate({
      path: "companyId",
      populate: { path: "accountId", model: "Account" }, // Populate account details
    });

    if (gracePeriodDocuments.length > 0) {
      const affectedAccounts = gracePeriodDocuments.map(
        (doc) => doc.companyId.accountId
      );
      const affectedEmails = gracePeriodDocuments.map(
        (doc) => doc.companyId.accountId.emailAddress
      );

      console.log("Affected Account IDs:", affectedAccounts);
      console.log("Affected Emails:", affectedEmails);

      // Update documents to mark as within grace period
      await CompanyDocuments.updateMany(
        { _id: { $in: gracePeriodDocuments.map((doc) => doc._id) } },
        { $set: { gracePeriod: true } }
      );

      // Send notifications & emails
      for (let i = 0; i < affectedAccounts.length; i++) {
        const businessName =
          gracePeriodDocuments[i]?.companyId?.companyInformation
            ?.businessName || "Your Company";
        const expirationDate = gracePeriodDate.toDateString();
        const employerId = affectedAccounts[i];
        const employerEmail = affectedEmails[i];

        const notificationMessage = `Your company "${businessName}" has documents expiring soon. Please renew them before ${expirationDate} to avoid accreditation issues.`;

        try {
          // In-app notification
          await createNotification({
            to: employerId,
            from: "67506d8638ae7596d5cff29f", // System notification
            title: "Important: Document Expiring Soon",
            message: notificationMessage,
            type: "warning",
          });

          console.log(`Notification sent to ${employerId}`);

          // Email notification
          if (employerEmail) {
            await sendEmail({
              to: employerEmail,
              subject: "Important: Your Documents Are Expiring Soon",
              text: notificationMessage,
              html: `
                <p>Hello,</p>
                <p>Your company <strong>${businessName}</strong> has documents expiring soon.</p>
                <p>Please renew them before <strong>${expirationDate}</strong> to avoid accreditation issues.</p>
                <p>Thank you.</p>
              `,
            });

            console.log(`Email sent to ${employerEmail}`);
          } else {
            console.warn(
              `No email found for employer ${employerId}, skipping email notification.`
            );
          }
        } catch (error) {
          console.error(
            `Error sending notification/email to ${employerId}:`,
            error
          );
        }
      }

      console.log(
        `✔ Marked ${gracePeriodDocuments.length} documents as within the grace period. Notifications and emails sent.`
      );
    } else {
      console.log("❌ No documents found within the grace period.");
    }
  } catch (error) {
    console.error(
      "❌ Error while marking grace period documents and sending notifications/emails:",
      error
    );
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
    }).populate({
      path: "companyId",
      populate: { path: "accountId", model: "Account" }, // Populate account details
    });

    if (expiredDocuments.length > 0) {
      const expiredCompanyIds = expiredDocuments.map(
        (doc) => doc.companyId._id
      );
      const affectedAccounts = expiredDocuments.map(
        (doc) => doc.companyId.accountId
      );
      const affectedEmails = expiredDocuments.map(
        (doc) => doc.companyId.accountId.emailAddress
      );

      // Mark documents as expired
      await CompanyDocuments.updateMany(
        { _id: { $in: expiredDocuments.map((doc) => doc._id) } },
        { status: "expired" }
      );

      // Revoke company accreditation
      await Company.updateMany(
        { _id: { $in: expiredCompanyIds } },
        {
          $set: {
            status: "revoked",
            accreditation: null,
            accreditationId: null,
            accreditationDate: null,
          },
        }
      );

      // Send notifications & emails
      for (let i = 0; i < affectedAccounts.length; i++) {
        const businessName =
          expiredDocuments[i]?.companyId?.companyInformation?.businessName ||
          "Your Company";
        const employerId = affectedAccounts[i];
        const employerEmail = affectedEmails[i];

        const notificationMessage = `Your company "${businessName}" has had its accreditation revoked due to expired documents. Please update your documents to regain accreditation.`;

        try {
          // In-app notification
          await createNotification({
            to: employerId,
            from: "67506d8638ae7596d5cff29f", // System notification
            title: "Accreditation Revoked Due to Expired Documents",
            message: notificationMessage,
            type: "warning",
          });

          console.log(`Notification sent to ${employerId}`);

          // Email notification
          if (employerEmail) {
            await sendEmail({
              to: employerEmail,
              subject: "Accreditation Revoked Due to Expired Documents",
              text: notificationMessage,
              html: `
                <p>Hello,</p>
                <p>Your company <strong>${businessName}</strong> has had its accreditation revoked due to expired documents.</p>
                <p>Please update your documents as soon as possible to regain accreditation.</p>
                <p>Thank you.</p>
              `,
            });

            console.log(`Email sent to ${employerEmail}`);
          } else {
            console.warn(
              `No email found for employer ${employerId}, skipping email notification.`
            );
          }
        } catch (error) {
          console.error(
            `Error sending notification/email to ${employerId}:`,
            error
          );
        }
      }

      console.log(
        `✔ Marked ${expiredDocuments.length} documents and ${expiredCompanyIds.length} companies as "expired". Notifications and emails sent.`
      );
    } else {
      console.log("No expired documents or companies found.");
    }
  } catch (error) {
    console.error(
      "Error while updating expired documents, companies, and sending notifications/emails:",
      error
    );
  }
};

// const checkAndExpireJobVacancies = async (now) => {
//   try {
//     const result = await JobVacancy.updateMany(
//       { applicationDeadline: { $lt: now }, status: { $ne: "expired" } },
//       { $set: { status: "expired" } }
//     );

//     console.log(`${result.modifiedCount} job vacancies marked as expired.`);
//   } catch (error) {
//     console.error("Error updating expired job vacancies:", error);
//   }
// };

// Schedule the cron job to run daily at midnight

const checkAndExpireJobVacancies = async (now) => {
  try {
    // Find job vacancies that have expired
    const expiredJobVacancies = await JobVacancy.find({
      applicationDeadline: { $lt: now },
      status: { $ne: "expired" },
    }).populate({
      path: "companyId",
      populate: { path: "accountId", model: "Account" }, // Populate employer details
    });

    if (expiredJobVacancies.length > 0) {
      const affectedEmployers = expiredJobVacancies.map(
        (job) => job.companyId.accountId
      );
      const affectedEmails = expiredJobVacancies.map(
        (job) => job.companyId.accountId.emailAddress
      );

      // Mark job vacancies as expired
      const result = await JobVacancy.updateMany(
        { _id: { $in: expiredJobVacancies.map((job) => job._id) } },
        { $set: { status: "expired" } }
      );

      // Send notifications & emails
      for (let i = 0; i < affectedEmployers.length; i++) {
        const businessName =
          expiredJobVacancies[i]?.companyId?.companyInformation?.businessName ||
          "Your Company";
        const jobTitle =
          expiredJobVacancies[i]?.title || "One of your job vacancies";
        const employerId = affectedEmployers[i];
        const employerEmail = affectedEmails[i];

        const notificationMessage = `Your job vacancy "${jobTitle}" at "${businessName}" has expired. Please post a new job if you wish to continue hiring.`;

        try {
          // In-app notification
          await createNotification({
            to: employerId,
            from: "67506d8638ae7596d5cff29f", // System notification
            title: "Job Vacancy Expired",
            message: notificationMessage,
            type: "info",
          });

          console.log(`Notification sent to ${employerId}`);

          // Email notification
          if (employerEmail) {
            await sendEmail({
              to: employerEmail,
              subject: "Your Job Vacancy Has Expired",
              text: notificationMessage,
              html: `
                <p>Hello,</p>
                <p>Your job vacancy <strong>"${jobTitle}"</strong> at <strong>"${businessName}"</strong> has expired.</p>
                <p>If you wish to continue hiring, please post a new job listing.</p>
                <p>Thank you.</p>
              `,
            });

            console.log(`Email sent to ${employerEmail}`);
          } else {
            console.warn(
              `No email found for employer ${employerId}, skipping email notification.`
            );
          }
        } catch (error) {
          console.error(
            `Error sending notification/email to ${employerId}:`,
            error
          );
        }
      }

      console.log(
        `✔ Marked ${result.modifiedCount} job vacancies as "expired". Notifications and emails sent.`
      );
    } else {
      console.log("No expired job vacancies found.");
    }
  } catch (error) {
    console.error(
      "❌ Error updating expired job vacancies and sending notifications/emails:",
      error
    );
  }
};

const deleteExpiredAccounts = async () => {
  try {
    const now = new Date();

    // Find accounts where deletionDate is in the past
    const accountsToDelete = await Account.find({ deletedAt: { $lte: now } });

    if (accountsToDelete.length === 0) {
      console.log("No expired accounts to delete.");
      return;
    }

    console.log(`Deleting ${accountsToDelete.length} expired accounts...`);

    for (const account of accountsToDelete) {
      console.log(`Processing account: ${account.emailAddress}`);

      if (account.role?.trim().toLowerCase() === "jobseeker") {
        console.log(`Deleting jobseeker data for: ${account.emailAddress}`);

        const jobSeeker = await JobSeeker.findOneAndDelete({
          accountId: account._id,
        });

        if (jobSeeker) {
          await Application.deleteMany({ jobSeekerId: jobSeeker._id });
          await JobInvitation.deleteMany({ jobSeekerId: jobSeeker._id });
          console.log(
            `Deleted jobseeker-related data for: ${account.emailAddress}`
          );
        }
      } else if (account.role?.trim().toLowerCase() === "employer") {
        console.log(`Deleting employer data for: ${account.emailAddress}`);

        const company = await Company.findOne({ accountId: account._id });

        if (company) {
          await JobVacancy.deleteMany({ companyId: company._id });
          await Application.deleteMany({
            jobVacancyId: { $in: company.jobVacancies },
          });
          await CompanyDocuments.deleteMany({ companyId: company._id });
          await Company.findByIdAndDelete(company._id);
          console.log(
            `Deleted employer-related data for: ${account.emailAddress}`
          );
        }
      }

      // Finally, delete the account
      await Account.findByIdAndDelete(account._id);
      console.log(`Successfully deleted account: ${account.emailAddress}`);
    }

    console.log("Expired account deletion process completed.");
  } catch (error) {
    console.error("Error deleting expired accounts:", error);
  }
};

// Function to deactivate inactive accounts
const deactivateInactiveAccounts = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Exactly 1 year ago

    const result = await Account.updateMany(
      {
        lastActive: { $lt: oneYearAgo },
        isActive: true, // Only target currently active accounts
      },
      {
        $set: { isActive: false },
        $currentDate: { updatedAt: true },
      }
    );

    console.log(`Deactivated ${result.modifiedCount} inactive accounts.`);
  } catch (error) {
    console.error("Error deactivating inactive accounts:", error);
  }
};

cron.schedule("0 0 * * *", async () => {
  console.log("Running the daily cron job...");

  const now = new Date();
  const gracePeriodDate = new Date(now);
  gracePeriodDate.setDate(now.getDate() + 30);

  await checkAndMarkGracePeriodDocuments(now, gracePeriodDate);
  await checkAndExpireDocuments(now);
  await checkAndExpireJobVacancies(now);
  await deleteExpiredAccounts();
  await deactivateInactiveAccounts();
});

export { io, userSocketMap };
