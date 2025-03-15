import { Account } from "../models/account.model.js";

export const checkBlocked = async (req, res, next) => {
  try {
    const accountId = req.accountId; 

    // Find user by ID
    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    // Check if user is blocked
    if (account.isBlocked) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Your account is blocked.",
        });
    }

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Error in checkBlocked middleware:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
