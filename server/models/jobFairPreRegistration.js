// models/JobFairPreregistration.js
import mongoose from "mongoose";

const jobFairPreregistrationSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobSeeker",
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobFairEvent",
      required: true,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      required: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    qrCode: {
      type: String, // base64 image string (e.g., for frontend use)
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Avoid duplicate preregistration per account + event
jobFairPreregistrationSchema.index({ account: 1, event: 1 }, { unique: true });

const JobFairPreregistration = mongoose.model(
  "JobFairPreregistration",
  jobFairPreregistrationSchema
);
export default JobFairPreregistration;
