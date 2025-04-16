import mongoose from "mongoose";

const jobFairAttendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobFairEvent",
      required: true,
    },
    preRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobFairPreregistration",
      required: true,
      unique: true, // Ensure one attendance per prereg
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
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
    referenceNumber: {
      type: String,
      required: true,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const JobFairAttendance = mongoose.model(
  "JobFairAttendance",
  jobFairAttendanceSchema
);
export default JobFairAttendance;
