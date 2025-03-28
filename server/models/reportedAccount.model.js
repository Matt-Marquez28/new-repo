import mongoose from "mongoose";

const reportedAccountSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    }, // User being reported (only one document per user)
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        }, // Who reported
        reason: { type: String, required: true },
        details: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const ReportedAccount = mongoose.model(
  "ReportedAccount",
  reportedAccountSchema
);

export default ReportedAccount;
