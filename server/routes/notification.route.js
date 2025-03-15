import express from "express";
import {
  getAllNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// routes for notifications
router.get("/get-all-notifications", isAuthenticated, getAllNotifications);
router.put("/mark-as-read/:id", markAsRead);
router.delete("/delete-notification/:notificationId", deleteNotification);

export default router;
