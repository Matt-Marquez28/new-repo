import Notification from "../models/notification.model.js";

// Create a new notification
export const createNotification = async ({
  accountId,
  title,
  message,
  type,
}) => {
  try {
    const notification = new Notification({ accountId, title, message, type });
    return await notification.save();
  } catch (error) {
    throw new Error(error.message);
  }
};
