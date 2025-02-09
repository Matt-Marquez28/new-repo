import Notification from "../models/notification.model.js";

// Get all notifications
export const getAllNotifications = async (req, res) => {
  const accountId = req.accountId;
  console.log("Account ID", accountId);
  try {
    const notifications = await Notification.find({ accountId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// mark as read
export const markAsRead = async (id) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      throw new Error("Notification not found");
    }
    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

// delete notification
export const deleteNotification = async (id) => {
  try {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    return { message: "Notification deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};
