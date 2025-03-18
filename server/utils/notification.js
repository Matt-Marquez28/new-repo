import Notification from "../models/notification.model.js";

// Create a new notification
export const createNotification = async ({
  to,
  from,
  title,
  message,
  type,
  link,
}) => {
  try {
    const notification = new Notification({ to, from, title, message, type, link });
    return await notification.save();
  } catch (error) {
    throw new Error(error.message);
  }
};
