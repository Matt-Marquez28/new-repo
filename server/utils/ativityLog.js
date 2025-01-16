import ActivityLog from "../models/activityLog.model.js";

export const logActivity = async ({ accountId, action, details }) => {
  try {
    await ActivityLog.create({
      accountId,
      action,
      details,
    });
  } catch (error) {
    console.log(error);
  }
};
