import AuditTrail from "../models/auditTrail.model.js";

export const auditTrail = async ({ accountId, action, details }) => {
  try {
    await AuditTrail.create({
      accountId,
      action,
      details,
    });
  } catch (error) {
    console.log(error);
  }
};
