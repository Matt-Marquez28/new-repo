import mongoose from "mongoose";

const auditTrailSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    action: { type: String, required: true },
    details: { type: Object, required: false },
  },
  { timestamps: true }
);

const AuditTrail = mongoose.model("AuditTrail", auditTrailSchema);

export default AuditTrail;
