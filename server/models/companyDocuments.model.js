import mongoose from "mongoose";

const CompanyDocumentsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    dti: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    mayorsPermit: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    birRegistration: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    secCertificate: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    pagibigRegistration: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    philhealthRegistration: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    sss: {
      originalName: { type: String },
      url: { type: String },
      expiresAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["pending", "verified", "declined", "expired"],
      default: "pending",
    },
    remarks: {
      type: String,
      default: "",
    },
    isRenewal: {
      type: Boolean,
      default: false,
    },
    gracePeriod: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const CompanyDocuments = mongoose.model(
  "CompanyDocuments",
  CompanyDocumentsSchema
);

export default CompanyDocuments;
