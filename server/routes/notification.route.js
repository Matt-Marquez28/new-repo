import express from "express";
import {
  getAllNotifications,
  deleteNotification,
  markAllAsRead,
  hasUnreadNotifications,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// routes for notifications
router.get("/get-all-notifications", isAuthenticated, getAllNotifications);
router.delete("/delete-notification/:notificationId", deleteNotification);
router.put("/mark-all-as-read", isAuthenticated, markAllAsRead);
router.get("/has-unread", isAuthenticated, hasUnreadNotifications);

export default router;
