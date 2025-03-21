import Notification from "../models/notification.model.js";
import { io, userSocketMap } from "../index.js";

// Create a new notification
// export const createNotification = async ({
//   to,
//   from,
//   title,
//   message,
//   type,
//   link,
// }) => {
//   try {
//     const notification = new Notification({
//       to,
//       from,
//       title,
//       message,
//       type,
//       link,
//     });
//     return await notification.save();
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// Create a new notification and emit it in real-time
export const createNotification = async ({
  to,
  from,
  title,
  message,
  type,
  link,
}) => {
  try {
    const notification = new Notification({
      to,
      from,
      title,
      message,
      type,
      link,
    });
    const savedNotification = await notification.save();

    // Ensure `to` is a string
    const receiverId = to._id.toString(); // Convert ObjectId to string
    console.log(`Trying to send notification to user: ${receiverId}`);
    console.log("Current userSocketMap:", userSocketMap);

    // Emit real-time notification
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notification", savedNotification);
      console.log(
        `✅ Notification sent to user ${receiverId} (Socket ID: ${receiverSocketId}):`,
        savedNotification
      );
    } else {
      console.log(
        `❌ User ${receiverId} is offline (No active socket connection). Notification saved.`
      );
    }

    return savedNotification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw new Error(error.message);
  }
};
