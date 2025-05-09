import { Account } from "../models/account.model.js";
import JobSeeker from "../models/jobSeeker.model.js";
import Company from "../models/company.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import Token from "../models/token.model.js";
import crypto from "crypto";
import ResetToken from "../models/resetToken.model.js";
import Application from "../models/application.model.js";
import JobInvitation from "../models/jobInvitation.model.js";
import JobVacancy from "../models/jobVacancy.model.js";
import CompanyDocuments from "../models/companyDocuments.model.js";
import ReportedAccount from "../models/reportedAccount.model.js";

// signup controller
export const signup = async (req, res) => {
  const { firstName, lastName, mobileNumber, emailAddress, password, role } =
    req.body;

  try {
    // check if the email already exists
    const existingUser = await Account.findOne({ emailAddress });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // check if the phone number already exists
    const existingMobileNumber = await Account.findOne({ mobileNumber });
    if (existingMobileNumber) {
      return res
        .status(400)
        .json({ message: "Mobile number is already in use" });
    }

    // create new account object
    const newAccount = new Account({
      firstName,
      lastName,
      mobileNumber,
      emailAddress,
      password,
      role,
    });

    // save the account to the database (password will be hashed due to pre-save middleware)
    const savedAccount = await newAccount.save();

    // if account is a job seeker, create initial job seeker data
    if (role === "jobseeker") {
      const initialJobSeekerData = new JobSeeker({
        accountId: savedAccount._id,
        personalInformation: {
          firstName,
          lastName,
          emailAddress,
          mobileNumber,
        },
      });

      // Save job seeker data to the database
      await initialJobSeekerData.save({ validateBeforeSave: false });
    }

    // return success response
    res.status(201).json({
      success: true,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// login controller
export const login = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    // find account
    const account = await Account.findOne({ emailAddress });

    // if account not found
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    // compare password
    const isPasswordMatch = await bcrypt.compare(password, account.password);

    // if password does not match
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password!" });
    }

    // Remove password from accountData before sending it back
    const accountData = account.toObject();
    delete accountData.password;

    // token data object creation
    const tokenData = {
      accountId: account._id,
      role: account.role,
    };

    // user data creation
    const userData = {
      accountData,
    };

    // if account role is jobseeker
    if (account.role === "jobseeker") {
      try {
        const jobSeeker = await JobSeeker.findOne({ accountId: account._id });
        if (jobSeeker) {
          tokenData.jobSeekerId = jobSeeker._id;
          userData.profileData = jobSeeker;
        }
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error!" });
      }
    }

    // if account role is employer
    if (account.role === "employer") {
      try {
        const company = await Company.findOne({
          accountId: account._id,
        }).populate({
          path: "jobVacancies",
          select: "jobTitle", // Only select the jobTitle field
        });
        if (company) {
          tokenData.companyId = company._id;
          userData.companyData = company;
        }
      } catch (error) {
        return res
          .status(500)
          .json({ success: false, message: "Internal server error!" });
      }
    }

    // generate token
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Update lastActive timestamp
    await Account.findByIdAndUpdate(account._id, { lastActive: new Date() });

    // If user had a pending deletion, cancel it
    if (account.deletedAt) {
      account.deletedAt = null;
      await account.save();
    }

    // success response
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .json({
        success: true,
        message: `Successfully Logged In, Hello! ${account.firstName}`,
        account: accountData, // send accountData without password
        userData,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// logout controller
export const logout = async (req, res) => {
  try {
    res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: true, message: "Internal server error!" });
  }
};

// login controller for admin
export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email is provided
    if (!email) {
      return sendError(res, 400, "Email is required.");
    }

    // Find the account by email
    const account = await Account.findOne({ email });

    // If no user is found
    if (!account) {
      return sendError(res, 400, "Invalid email or password.");
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return sendError(res, 400, "Invalid email or password.");
    }

    // Check if the user is an admin
    if (account.role !== "admin") {
      return sendError(res, 403, "You do not have admin access.");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: account._id, role: account.role },
      ADMIN_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Success response
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: `Successfully Logged In, Hello! ${account.firstName}`,
        account,
      });
  } catch (error) {
    console.error("Error during admin login:", error);
    return sendError(res, 500, "Internal Server Error");
  }
};

// create new system user controller
export const createNewSystemUser = async (req, res) => {
  try {
    const { firstName, lastName, emailAddress, password, role } = req.body;

    // Check if user already exists
    const user = await Account.findOne({ emailAddress });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    // Create a new user
    const newAccount = new Account({
      firstName,
      lastName,
      emailAddress,
      password,
      role,
    });

    // save the account to the database (password will be hashed due to pre-save middleware)
    const savedAccount = await newAccount.save();

    res
      .status(200)
      .json({ success: true, message: "New user created!", savedAccount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// generate OTP controller
export const generateOTP = async (req, res) => {
  const { emailAddress } = req.body;

  try {
    // check if email is provided
    if (!emailAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    // check if an OTP already exists for the email address
    const existingToken = await Token.findOne({ emailAddress });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: "An OTP already exists for this email address.",
      });
    }

    // generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // hash the OTP
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    // Save the OTP hash in the database
    await Token.create({ emailAddress, otp: hashedOtp });

    // email later
    await sendEmail({
      to: emailAddress,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: "OTP has been created!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// verify OTP controller
export const verifyOTP = async (req, res) => {
  try {
    const { emailAddress, otp } = req.body;
    if (!emailAddress && !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email & OTP are required!" });
    }

    const record = await Token.findOne({ emailAddress });
    if (!record) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }

    // compare the provided OTP with the hashed OTP stored in the database
    const isMatch = await bcrypt.compare(otp.toString(), record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid, delete it from the database
    await Token.deleteOne({ _id: record._id });

    // successfull response
    res.status(200).json({ success: true, message: "Successfully verified!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all system users controller (admin, staff)
export const getAllSystemUsers = async (req, res) => {
  try {
    const users = await Account.find({
      role: { $in: ["staff", "admin"] },
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// delete system user
export const deleteSystemUser = async (req, res) => {
  try {
    const { accountId } = req.params; // Assuming the ID is passed as a route parameter

    // Find the user by ID and delete
    const deletedUser = await Account.findByIdAndDelete(accountId);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// refresh user data
export const refreshUserData = async (req, res) => {
  try {
    const { jobSeekerId, companyId, accountId } = req; // Extract from request

    // Initialize user data
    const userData = {};

    // Handle Job Seeker Data
    if (jobSeekerId) {
      const jobSeeker = await JobSeeker.findById(jobSeekerId).populate(
        "savedJobVacancies"
      );
      if (!jobSeeker) {
        return res
          .status(404)
          .json({ success: false, message: "Job Seeker profile not found" });
      }

      const account = await Account.findById(jobSeeker.accountId).select(
        "-password"
      );
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      userData.accountData = account;
      userData.profileData = jobSeeker;
    }

    // Handle Employer Data
    if (companyId) {
      const company = await Company.findById(companyId).populate({
        path: "jobVacancies",
        select: "jobTitle", // Select specific fields if needed
      });
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Employer profile not found" });
      }

      const account = await Account.findById(company.accountId).select(
        "-password"
      );
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }

      userData.accountData = account;
      userData.companyData = company;
    }

    if (accountId && !jobSeekerId && !companyId) {
      const account = await Account.findById(accountId).select("-password");
      if (!account) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found" });
      }
      userData.accountData = account;
    }

    // Respond with the user data
    return res.status(200).json({
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller for handling forgot password request
export const forgotPassword = async (req, res) => {
  const { emailAddress } = req.body;

  // Generate a unique reset token
  const generateResetToken = () => {
    return crypto.randomBytes(32).toString("hex"); // Generates a 64-character token
  };

  try {
    console.log("Checking if user exists...");
    // Check if the user exists
    const user = await Account.findOne({ emailAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email address does not exist.",
      });
    }

    console.log("Generating reset token...");
    // Generate a unique reset token
    const resetToken = generateResetToken();

    // Set expiration time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in milliseconds

    console.log("Saving reset token to database...");
    // Save the reset token to the ResetToken collection
    const resetTokenDoc = new ResetToken({
      emailAddress,
      token: resetToken,
      expiresAt,
    });
    await resetTokenDoc.save();

    console.log("Creating reset link...");
    // Create the reset password link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    console.log("Sending reset link to email...");
    // Send the reset link to the user's email
    const emailSubject = "Password Reset Request";
    const emailText = `Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 10 minutes.`;
    const emailHtml = `
      <div>
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      to: emailAddress,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    console.log("Reset link sent successfully.");
    // Respond with success message
    res.status(200).json({
      success: true,
      message:
        "Password reset link sent to your email address. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
      error: error.message, // Include the error message in the response
    });
  }
};

// verify reset token
export const verifyResetToken = async (req, res) => {
  const { resetToken } = req.body; // Extract the token from the request body

  try {
    console.log("Verifying reset token...");
    // Find the token in the database
    const resetTokenDoc = await ResetToken.findOne({ token: resetToken });

    // If the token is not found, it is invalid or expired
    if (!resetTokenDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    console.log("Token is valid.");
    // Token is valid
    res.status(200).json({
      success: true,
      message: "Token is valid.",
      emailAddress: resetTokenDoc.emailAddress, // Optional: Return the associated email address
    });
  } catch (error) {
    console.error("Error in verifyResetToken controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the token.",
      error: error.message, // Include the error message in the response
    });
  }
};

// reset the password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log("Resetting password...");

    // Find the token in the database
    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Find the user by email address
    const user = await Account.findOne({
      emailAddress: resetToken.emailAddress,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update the user's password (automatic hashing is handled by the model)
    user.password = newPassword;
    await user.save();

    // Delete the reset token from the database
    await ResetToken.deleteOne({ token });

    console.log("Password reset successfully.");
    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Error in resetPassword controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
      error: error.message, // Include the error message in the response
    });
  }
};

// change password
export const changePassword = async (req, res) => {
  const { accountId } = req;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if the new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New password and confirmation do not match.",
    });
  }

  // Ensure new password is at least 8 characters long (basic validation)
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters long.",
    });
  }

  // Find the account by accountId
  try {
    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    // Check if the current password is correct
    const isMatch = await account.matchPassword(currentPassword); // Assuming comparePassword is a method defined in your schema
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Update the account's password (the hashing will be handled by your schema)
    account.password = newPassword;
    await account.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

// get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = { role: { $nin: ["staff", "admin"] } };

    // Apply role filter if provided
    if (role && role !== "all") {
      query.role = role;
    }

    // Apply search filter if provided (searching by firstName OR emailAddress)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } }, // Search by first name
        { emailAddress: { $regex: search, $options: "i" } }, // Search by email
      ];
    }

    const users = await Account.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// toggle block user
export const toggleBlockUser = async (req, res) => {
  const { accountId } = req.params;

  console.log("Received request to toggle block status for:", accountId);

  try {
    // Find account
    const account = await Account.findById(accountId);
    if (!account) {
      console.log("Account not found:", accountId);
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    // Toggle block status
    account.isBlocked = !account.isBlocked;
    await account.save();
    console.log(
      `User ${account.isBlocked ? "blocked" : "unblocked"} successfully`
    );

    return res.status(200).json({
      success: true,
      message: `User has been ${
        account.isBlocked ? "blocked" : "unblocked"
      } successfully.`,
      user: {
        _id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        emailAddress: account.emailAddress,
        isBlocked: account.isBlocked,
      },
    });
  } catch (error) {
    console.error("Error toggling block status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  const { accountId } = req.params;
  console.log("Received request to delete user:", accountId);

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      console.log("Account not found:", accountId);
      return res
        .status(404)
        .json({ success: false, message: "Account not found." });
    }

    console.log(
      `Account found: ${account.emailAddress}, Role: '${account.role}'`
    );

    /** --------------------------- DELETE JOBSEEKER RELATED DATA --------------------------- **/
    if (account.role?.trim().toLowerCase() === "jobseeker") {
      console.log(`Deleting jobseeker data for account: ${accountId}`);

      // Find and delete the jobseeker profile
      const jobSeeker = await JobSeeker.findOneAndDelete({ accountId });

      if (jobSeeker) {
        console.log("JobSeeker found and deleted:", jobSeeker._id);

        // Delete all job applications by the jobseeker
        // const deletedApps = await Application.deleteMany({
        //   jobSeekerId: jobSeeker._id,
        // });
        // console.log(`Deleted Applications: ${deletedApps.deletedCount}`);

        // Delete all job invitations sent to the jobseeker
        const deletedInvitations = await JobInvitation.deleteMany({
          jobSeekerId: jobSeeker._id,
        });
        console.log(
          `Deleted Job Invitations: ${deletedInvitations.deletedCount}`
        );
      } else {
        console.log(`No JobSeeker profile found for account: ${accountId}`);
      }
    } else if (account.role?.trim().toLowerCase() === "employer") {
      /** --------------------------- DELETE EMPLOYER RELATED DATA --------------------------- **/
      console.log(`Deleting employer data for account: ${accountId}`);

      // Find the employer's company
      const company = await Company.findOne({ accountId });

      if (company) {
        console.log("Company found:", company._id);

        // Step 1: Delete all job vacancies posted by this company
        const deletedJobs = await JobVacancy.deleteMany({
          companyId: company._id,
        });
        console.log(`Deleted Job Vacancies: ${deletedJobs.deletedCount}`);

        // Step 2: Delete all applications for jobs that belonged to the company
        // const deletedApplications = await Application.deleteMany({
        //   jobVacancyId: { $in: company.jobVacancies }, // Use array of jobVacancies
        // });
        // console.log(
        //   `Deleted Job Applications: ${deletedApplications.deletedCount}`
        // );

        // Step 3: Delete company documents
        const deletedDocs = await CompanyDocuments.deleteMany({
          companyId: company._id,
        });
        console.log(`Deleted Company Documents: ${deletedDocs.deletedCount}`);

        // Step 4: Delete the company itself
        await Company.findByIdAndDelete(company._id);
        console.log("Company deleted successfully:", company._id);
      } else {
        console.log(
          `No Company profile found for employer account: ${accountId}`
        );
      }
    } else {
      console.log(
        `Account is neither jobseeker nor employer. No related data deleted.`
      );
    }

    /** --------------------------- DELETE ACCOUNT --------------------------- **/
    await Account.findByIdAndDelete(accountId);
    console.log(`User ${account.emailAddress} deleted successfully`);

    return res.status(200).json({
      success: true,
      message: "User and related data deleted successfully.",
      deletedUser: {
        _id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        emailAddress: account.emailAddress,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// mark account for deletion
export const markForDeletion = async (req, res) => {
  try {
    const accountId = req.accountId;

    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 30);

    const account = await Account.findByIdAndUpdate(
      accountId,
      { deletedAt },
      { new: true }
    );

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    res.json({
      success: true,
      message: "Account marked for deletion",
      deletedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

export const cancelDeletion = async (req, res) => {
  try {
    const { accountId } = req.body;

    const account = await Account.findByIdAndUpdate(
      accountId,
      { deletionDate: null },
      { new: true }
    );

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    res.json({ success: true, message: "Account deletion canceled." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// report account controller
export const reportAccount = async (req, res) => {
  const reportedBy = req.accountId;
  try {
    const { accountId, reason, details } = req.body;

    if (!accountId || !reportedBy || !reason || !details) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let report = await ReportedAccount.findOne({ accountId });

    if (report) {
      // If the account is already reported, add a new report entry
      report.reports.push({ reportedBy, reason, details });
    } else {
      // If no report exists, create a new document
      report = new ReportedAccount({
        accountId,
        reports: [{ reportedBy, reason, details }],
      });
    }

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// get reported accounts controller
export const getReportedAccounts = async (req, res) => {
  try {
    const reportedAccounts = await ReportedAccount.find({})
      .populate("accountId", "firstName lastName emailAddress role")
      .populate("reports.reportedBy", "firstName emailAddress");

    res.status(200).json({ reportedAccounts });
  } catch (error) {
    console.error("Error fetching reported accounts:", error);
    res.status(500).json({ message: "Server error while fetching reports." });
  }
};

// get account statistics
export const getAccountStatistics = async (req, res) => {
  try {
    // Count jobseekers
    const jobseekerCount = await Account.countDocuments({
      role: "jobseeker",
      deletedAt: null, // Exclude soft-deleted accounts
    });

    // Count employers
    const employerCount = await Account.countDocuments({
      role: "employer",
      deletedAt: null, // Exclude soft-deleted accounts
    });

    // Count all active accounts (optional)
    const totalActiveAccounts = await Account.countDocuments({
      deletedAt: null,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        jobseekers: jobseekerCount,
        employers: employerCount,
        totalActiveAccounts: totalActiveAccounts, // Optional
      },
    });
  } catch (error) {
    console.error("Error fetching account statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account statistics",
      error: error.message,
    });
  }
};
