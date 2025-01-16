import mongoose from "mongoose";

const jobSeekerDocumentsSchema = new mongoose.Schema(
  {
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobSeeker",
      required: true,
    },
    validId1: {
      type: String,
      required: true,
    },
    validId1OriginalName: {
      type: String,
      required: true,
    },
    validId2: {
      type: String,
      required: true,
    },
    validId2OriginalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "declined", "expired"],
      default: "pending",
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const JobSeekerDocuments = mongoose.model(
  "JobSeekerDocuments",
  jobSeekerDocumentsSchema
);

export default JobSeekerDocuments;
