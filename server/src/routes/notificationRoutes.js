import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

/* =========================
   NOTIFICATION ROUTES
========================= */

// Get all notifications
router.get("/", protect, getNotifications);

// Mark one notification as read
router.put("/:id/read", protect, markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

// Delete a notification
router.delete("/:id", protect, deleteNotification);

export default router;
