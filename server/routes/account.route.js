import express from "express";
import {
  signup,
  login,
  logout,
  createNewSystemUser,
  generateOTP,
  verifyOTP,
  getAllSystemUsers,
  deleteSystemUser,
  refreshUserData,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  changePassword,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
} from "../controllers/account.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// routes for clients
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/generate-otp", generateOTP);
router.post("/verify-otp", verifyOTP);

// routes for administrator
router.post("/create-new-system-user", createNewSystemUser);
router.get("/get-all-system-users", getAllSystemUsers);
router.delete("/delete-system-user/:accountId", deleteSystemUser);
router.get("/refresh-user-data", isAuthenticated, refreshUserData);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);
router.post("/change-password", isAuthenticated, changePassword);
router.get("/get-all-users", isAuthenticated, getAllUsers);
router.put("/toggle-block-user/:accountId", isAuthenticated, toggleBlockUser);
router.delete("/delete-user/:accountId", isAuthenticated, deleteUser);

export default router;
