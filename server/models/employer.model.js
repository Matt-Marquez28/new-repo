import mongoose from "mongoose";

const EmployerDocumentsSchema = new mongoose.Schema(
  {
    dti: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    mayorsPermit: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    birRegistration: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    secCertificate: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    pagibigRegistration: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    philhealthRegistration: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    sss: {
      originalName: { type: String, required: true },
      url: { type: String, required: true },
    },
    remarks: {
      type: String,
      default: "",
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

const EmployerDocuments = mongoose.model(
  "EmployerDocuments",
  EmployerDocumentsSchema
);

export default EmployerDocuments;
