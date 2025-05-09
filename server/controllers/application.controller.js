import Application from "../models/application.model.js";
import JobVacancy from "../models/jobVacancy.model.js";
import Interview from "../models/interview.model.js";
import mongoose from "mongoose";
import JobSeeker from "../models/jobSeeker.model.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../index.js";
import Company from "../models/company.model.js";

export const applyJobVacancy = async (req, res) => {
  try {
    const { jobVacancyId } = req.params;
    const jobSeekerId = req.jobSeekerId;

    // Fetch job seeker details
    const jobSeeker = await JobSeeker.findById(jobSeekerId).select(
      "personalInformation.firstName personalInformation.lastName personalInformation.mobileNumber personalInformation.emailAddress"
    );

    if (!jobSeeker) {
      return res
        .status(404)
        .json({ success: false, message: "Job seeker not found" });
    }

    // Check if the job vacancy still exists and populate fields
    const jobVacancy = await JobVacancy.findById(jobVacancyId)
      .populate({
        path: "accountId",
        select: "emailAddress",
      })
      .populate({
        path: "companyId",
        select: "companyInformation.businessName",
      });

    if (!jobVacancy) {
      return res
        .status(404)
        .json({ success: false, message: "Job vacancy not found" });
    }

    // Check if the job seeker has already applied
    const existingApplication = await Application.findOne({
      jobSeekerId,
      jobVacancyId,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    // Create and save the new application with preserved data
    const newApplication = new Application({
      jobSeekerId,
      jobVacancyId,
      jobSeekerDetails: {
        firstName: jobSeeker.personalInformation.firstName,
        lastName: jobSeeker.personalInformation.lastName,
        mobileNumber: jobSeeker.personalInformation.mobileNumber,
        emailAddress: jobSeeker.personalInformation.emailAddress,
      },
      jobVacancyDetails: {
        jobTitle: jobVacancy.jobTitle,
        companyName: jobVacancy.companyId?.companyInformation?.businessName,
      },
    });

    await newApplication.save();

    // Update job vacancy applicants
    jobVacancy.applicants.push(jobSeekerId);
    await jobVacancy.save();

    // Send email notification to the employer
    if (jobVacancy.accountId?.emailAddress) {
      const emailContent = {
        to: jobVacancy.accountId.emailAddress,
        subject: `New Job Application Received for ${jobVacancy.jobTitle}`,
        text: `You have received a new application for the job vacancy: ${jobVacancy.jobTitle} at ${jobVacancy.companyId?.companyInformation?.businessName}.
        
        Applicant Details:
        Name: ${jobSeeker.personalInformation.firstName} ${jobSeeker.personalInformation.lastName}
        Email: ${jobSeeker.personalInformation.emailAddress}
        Mobile: ${jobSeeker.personalInformation.mobileNumber}`,
        html: `
          <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
            <div style="text-align: center; background-color: #007BFF; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">PESO City Government of Taguig</h1>
            </div>
            <h2 style="color: #2C3E50; text-align: center;">New Job Application Received</h2>
            <p>Dear Hiring Team,</p>
            <p>You have received a new application for the following job vacancy:</p>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Job Title:</strong> ${jobVacancy.jobTitle}</li>
              <li><strong>Company Name:</strong> ${
                jobVacancy.companyId?.companyInformation?.businessName
              }</li>
              <li><strong>Applicant Name:</strong> ${
                jobSeeker.personalInformation.firstName
              } ${jobSeeker.personalInformation.lastName}</li>
              <li><strong>Applicant Email:</strong> ${
                jobSeeker.personalInformation.emailAddress
              }</li>
              <li><strong>Applicant Phone:</strong> ${
                jobSeeker.personalInformation.mobileNumber
              }</li>
            </ul>
            <p style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/employer/application-details/${
          newApplication._id
        }" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Application</a>
            </p>
            <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
              © ${new Date().getFullYear()} | City Government of Taguig 
            </p>
          </div>
        `,
      };

      try {
        await sendEmail(emailContent);
      } catch (emailError) {
        console.error("Error sending email:", emailError.message);
      }
    }

    // Notify the employer
    try {
      await createNotification({
        to: jobVacancy.accountId,
        from: jobSeeker._id,
        title: "New Job Application Received",
        message: `${jobSeeker.personalInformation.firstName} ${jobSeeker.personalInformation.lastName} has applied for ${jobVacancy.jobTitle}`,
        type: "info",
        link: `/employer/application-details/${newApplication._id}`,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    // Emit real-time notification
    const employerSocketId = userSocketMap[jobVacancy.accountId._id];
    if (employerSocketId) {
      io.to(employerSocketId).emit("newApplication", {
        message: `${jobSeeker.personalInformation.firstName} ${jobSeeker.personalInformation.lastName} applied for ${jobVacancy.jobTitle}`,
        applicationId: newApplication._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Successfully applied to the job vacancy",
      application: {
        id: newApplication._id,
        status: newApplication.status,
        appliedAt: newApplication.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in applyJobVacancy:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// get all my application
export const getAllApplications = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const applications = await Application.find({ jobSeekerId })
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId",
        populate: {
          path: "companyId", // Populate companyId with the company data
          select:
            "companyInformation.businessName companyInformation.companyLogo", // Select only the businessName in companyInformation
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// delete applicaiton
export const deleteApplication = async (req, res) => {
  try {
    const { jobVacancyId } = req.params;
    const jobSeekerId = req.jobSeekerId;

    // Find the application document where jobVacancy and jobSeeker match
    const application = await Application.findOne({
      jobVacancyId,
      jobSeekerId,
    });

    // Check if the application exists
    if (!application) {
      return res
        .status(400)
        .json({ success: false, message: "Application not found!" });
    }

    // Check if the application status is "hired"
    if (application.status !== "pending" && application.status !== "declined") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete application unless the status is pending or declined.",
      });
    }

    // Delete the application
    await Application.findOneAndDelete({
      jobVacancyId,
      jobSeekerId,
    });

    // Remove applicant from the applicants array in job vacancy
    await JobVacancy.findByIdAndUpdate(jobVacancyId, {
      $pull: { applicants: jobSeekerId },
    });

    res
      .status(200)
      .json({ success: true, message: "Application has been deleted!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get employer applicants
export const getAllEmployerApplicants = async (req, res) => {
  try {
    const companyId = req.companyId;
    const { status } = req.query; // Get the status filter from the query params

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const matchConditions = {
      "jobVacancy.companyId": new mongoose.Types.ObjectId(companyId),
    };

    // Add status filter if it's not "all"
    if (status && status !== "all") {
      matchConditions.status = status;
    }

    const applicants = await Application.aggregate([
      {
        $lookup: {
          from: "jobvacancies",
          localField: "jobVacancyId",
          foreignField: "_id",
          as: "jobVacancy",
        },
      },
      { $unwind: "$jobVacancy" },
      { $match: matchConditions },
      {
        $lookup: {
          from: "jobseekers",
          localField: "jobSeekerId",
          foreignField: "_id",
          as: "jobSeeker",
        },
      },
      { $unwind: "$jobSeeker" },
      {
        $project: {
          jobSeekerId: "$jobSeeker._id",
          jobSeekerFirstName: "$jobSeeker.personalInformation.firstName",
          jobSeekerLastName: "$jobSeeker.personalInformation.lastName",
          photo: "$jobSeeker.personalInformation.photo",
          jobVacancyId: "$jobVacancy._id",
          jobVacancyTitle: "$jobVacancy.jobTitle",
          status: 1,
          createdAt: 1,
          updatedAt: 1, // Include updatedAt in the projection
          _id: 1,
        },
      },
      {
        $sort: {
          updatedAt: -1, // Sort by updatedAt in descending order
        },
      },
    ]);

    return res.status(200).json({ success: true, applicants });
  } catch (error) {
    console.error("Error fetching employer applicants:", error);
    return res.status(500).json({ message: "Unable to fetch applicants" });
  }
};

// get single application
export const getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate([
      { path: "jobSeekerId" },
      { path: "interviewId" },
      { path: "jobVacancyId" },
    ]);
    if (!application) {
      return res
        .status(400)
        .json({ success: false, message: "Application not found!" });
    }
    res.status(200).json({ success: true, application });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

// schedule interview
export const scheduleInterview = async (req, res) => {
  const { applicationId } = req.params;
  const companyId = req.companyId;
  const {
    interviewerName,
    emailAddress,
    mobileNumber,
    interviewDate,
    interviewTime,
    interviewLocation,
    interviewLink,
    interviewNotes,
  } = req.body;

  try {
    // Check if the application exists, and populate jobVacancy and jobSeekerId with accountId
    const application = await Application.findById(applicationId)
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId", // Select jobTitle and companyId
        populate: {
          path: "companyId",
          select: "companyInformation accountId", // Populate company information
        },
      })
      .populate({
        path: "jobSeekerId",
        select: "personalInformation accountId", // Include accountId to access emailAddress
        populate: {
          path: "accountId", // Populate accountId to access emailAddress
          select: "emailAddress", // Select only the emailAddress field
        },
      });

    if (!application) {
      return res
        .status(400)
        .json({ success: false, message: "Application doesn't exist!" });
    }

    // Check if the application is already hired
    if (application.status === "hired") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot schedule an interview for an application that is already hired.",
      });
    }

    // Validate required fields
    if (
      !interviewerName ||
      !emailAddress ||
      !mobileNumber ||
      !interviewDate ||
      !interviewTime ||
      !interviewLocation
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    let savedInterview;

    // Check if interview has already been scheduled for this application
    if (application.interviewId) {
      // Update the existing interview
      savedInterview = await Interview.findByIdAndUpdate(
        application.interviewId,
        {
          $set: {
            companyId,
            interviewerName,
            emailAddress,
            mobileNumber,
            interviewDate,
            interviewTime,
            interviewLocation,
            interviewLink,
            interviewNotes,
          },
        },
        { new: true }
      );

      if (!savedInterview) {
        return res
          .status(404)
          .json({ success: false, message: "Failed to update interview." });
      }

      // Update the application status to "interview scheduled"
      application.status = "interview scheduled";
      await application.save();
    } else {
      // Create a new interview instance
      const newInterview = new Interview({
        companyId,
        interviewerName,
        emailAddress,
        mobileNumber,
        interviewDate,
        interviewTime,
        interviewLocation,
        interviewLink,
        interviewNotes,
      });

      // Save the interview to the database
      savedInterview = await newInterview.save();

      // Update the application with the interviewId and status
      const updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            interviewId: savedInterview._id,
            status: "interview scheduled",
          },
        },
        { new: true }
      );

      if (!updatedApplication) {
        return res
          .status(404)
          .json({ success: false, message: "Failed to update application." });
      }
    }

    // Fetch the company name, job title, and applicant's email address
    const companyName =
      application?.jobVacancyId?.companyId?.companyInformation?.businessName;
    const jobTitle = application?.jobVacancyId?.jobTitle;
    const applicantName =
      application?.jobSeekerId?.personalInformation?.firstName;
    const applicantEmail = application?.jobSeekerId?.accountId?.emailAddress; // Access the email address here

    const emailContent = {
      to: applicantEmail, // Use the populated emailAddress
      subject: `Interview Schedule for ${jobTitle}`,
      text: `Your interview for the job position ${jobTitle} at ${companyName} has been scheduled. 
      Interview Details:
      Interviewer: ${interviewerName}
      Date: ${interviewDate}
      Time: ${interviewTime}
      Location: ${interviewLocation || "Online (check the provided link)"}
      Notes: ${interviewNotes || "No additional notes provided."}`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #007BFF; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">PESO City Government of Taguig</h1>
          </div>
          <h2 style="color: #2C3E50; text-align: center;">Interview Schedule</h2>
          <p>Dear ${applicantName},</p>
          <p>We are pleased to inform you that your interview has been scheduled for the following job:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company Name:</strong> ${companyName}</li>
          </ul>
          <h3>Interview Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Interviewer:</strong> ${interviewerName}</li>
            <li><strong>Date:</strong> ${interviewDate}</li>
            <li><strong>Time:</strong> ${interviewTime}</li>
            <li><strong>Location:</strong> ${
              interviewLocation || "Online (check the provided link)"
            }</li>
            ${
              interviewLink
                ? `<li><strong>Link:</strong> <a href="${interviewLink}" style="color: #007BFF;">Join Interview</a></li>`
                : ""
            }
            <li><strong>Notes:</strong> ${
              interviewNotes || "No additional notes provided."
            }</li>
          </ul>
          <p style="margin-top: 20px;">Please make sure to prepare for the interview and join on time.</p>
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    // Send the email notification
    await sendEmail(emailContent);

    // Create notification for the job seeker
    try {
      await createNotification({
        to: application?.jobSeekerId?.accountId, // Receiver (Job Seeker's Account ID)
        from: application?.jobVacancyId?.companyId?.accountId, // Sender (Company's Account ID)
        title: "Interview Scheduled",
        message: `Your interview for the ${jobTitle} position at ${companyName} has been scheduled on ${interviewDate} at ${interviewTime}.`,
        type: "info",
        link: `/jobseeker/application-details/${application._id}`, // Link to interview details
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    // Respond with the saved interview and updated application details
    res.status(201).json({
      success: true,
      message:
        "Interview scheduled and linked to the application successfully.",
      interview: savedInterview,
      application,
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while scheduling the interview.",
    });
  }
};

// cancel interview
export const cancelInterview = async (req, res) => {
  const { applicationId } = req.params;
  const companyId = req.companyId;

  try {
    // Find the application and populate the necessary fields
    const application = await Application.findById(applicationId)
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId",
        populate: {
          path: "companyId",
          select: "companyInformation",
        },
      })
      .populate({
        path: "jobSeekerId",
        select: "personalInformation accountId", // Include accountId to get email address
        populate: {
          path: "accountId",
          select: "emailAddress", // Populate accountId to get the email address
        },
      });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Find and delete the interview
    const interview = await Interview.findOneAndDelete({
      _id: application.interviewId,
      companyId: companyId,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // If the application is not hired, update its status to 'pending' and remove the interviewId
    if (application.status !== "hired") {
      application.status = "pending";
      application.interviewId = null;
      await application.save();
    }

    // Extract relevant details for email
    const companyName =
      application.jobVacancyId?.companyId?.companyInformation?.businessName ||
      "Unknown Company";
    const jobTitle =
      application.jobVacancyId?.jobTitle || "Job Title Not Available";
    const applicantName =
      application?.jobSeekerId?.personalInformation?.firstName || "Applicant";
    const emailAddress =
      application?.jobSeekerId?.accountId?.emailAddress || ""; // Get the email address from accountId

    const emailContent = {
      to: emailAddress,
      subject: `Interview Cancelled for ${jobTitle}`,
      text: `We regret to inform you that your interview for the job position ${jobTitle} at ${companyName} has been cancelled. 
      Interview Details:
      Job Title: ${jobTitle}
      Company: ${companyName}

      We apologize for any inconvenience this may cause.`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #FF4136; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">PESO City Government of Taguig</h1>
          </div>
          <h2 style="color: #2C3E50; text-align: center;">Interview Cancellation</h2>
          <p>Dear ${applicantName},</p>
          <p>We regret to inform you that your interview for the following job has been cancelled:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company Name:</strong> ${companyName}</li>
          </ul>
          <p style="margin-top: 20px;">We apologize for any inconvenience this may cause.</p>
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    // Send the email notification
    await sendEmail(emailContent);

    // Respond with success
    res.status(200).json({
      message: "Interview canceled successfully, and email notification sent.",
      application,
    });
  } catch (error) {
    console.error("Error canceling interview:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// schedule to previous interview
export const scheduleToPreviousInteview = async (req, res) => {
  const { applicationId } = req.params;
  const { interviewId } = req.body;
  try {
    // check existence of interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res
        .status(400)
        .json({ success: false, message: "Interview ID not found!" });
    }

    // check existence of application and update
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          interviewId: interviewId,
          status: "interview scheduled",
        },
      },
      { new: true }
    );

    if (!updatedApplication) {
      return res
        .status(400)
        .json({ success: false, message: "Interview ID not found!" });
    }

    // Respond with the saved interview and updated application details
    res.status(201).json({
      success: true,
      message:
        "Interview scheduled and linked to the application successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all interview titles
export const getInterviewTitles = async (req, res) => {
  const companyId = req.companyId;
  try {
    const interviewTitles = await Interview.find({ companyId });
    res.status(200).json({ success: true, interviewTitles });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// mark interview as completed
export const markInterviewAsCompleted = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "interview scheduled") {
      return res.status(400).json({
        message: "Interview can only be marked as completed if it is scheduled",
      });
    }

    application.status = "interview completed";
    await application.save();

    // Assuming there's an Interview model and interviewId is stored in application
    const interview = await Interview.findById(application.interviewId);
    if (interview) {
      interview.status = "interview completed";
      await interview.save();
    }

    res.status(200).json({
      message: "Interview marked as completed successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// hire applicant
export const hireApplicant = async (req, res) => {
  const { applicationId } = req.params;
  const { remarks } = req.body;

  try {
    const application = await Application.findById(applicationId)
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId",
        populate: {
          path: "companyId",
          select: "companyInformation accountId",
        },
      })
      .populate({
        path: "jobSeekerId",
        select: "personalInformation accountId",
        populate: {
          path: "accountId",
          select: "emailAddress",
        },
      });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!remarks) {
      return res
        .status(400)
        .json({ message: "Remarks are required when hiring an application" });
    }

    // Update the application status and add remarks and hired date
    application.status = "hired";
    application.remarks = remarks;
    application.hiredDate = new Date(); // Add the hired date
    await application.save();

    // Extract relevant details for email
    const companyName =
      application.jobVacancyId?.companyId?.companyInformation?.businessName ||
      "Unknown Company";
    const jobTitle =
      application.jobVacancyId?.jobTitle || "Job Title Not Available";
    const applicantName =
      application?.jobSeekerId?.personalInformation?.firstName || "Applicant";
    const emailAddress =
      application?.jobSeekerId?.accountId?.emailAddress || ""; // Get the email address from accountId

    const emailContent = {
      to: emailAddress,
      subject: `Congratulations! You've been hired for ${jobTitle}`,
      text: `Dear ${applicantName},\n\nWe are pleased to inform you that you have been hired for the job position ${jobTitle} at ${companyName}.\n\nRemarks: ${remarks}\n\nCongratulations on this achievement, and we look forward to working with you!`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #28A745; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">PESO City Government of Taguig</h1>
          </div>
          <h2 style="color: #2C3E50; text-align: center;">Congratulations! You've Been Hired</h2>
          <p>Dear ${applicantName},</p>
          <p>We are pleased to inform you that you have been hired for the following job position:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company Name:</strong> ${companyName}</li>
          </ul>
          <p><strong>Remarks:</strong> ${remarks}</p>
          <p style="margin-top: 20px;">Congratulations on this achievement, and we look forward to working with you!</p>
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    // Send the email notification
    await sendEmail(emailContent);

    // Send notification to job seeker
    try {
      await createNotification({
        to: application?.jobSeekerId?.accountId, // Receiver (Job Seeker's Account ID)
        from: application?.jobVacancyId?.companyId?.accountId, // Sender (Company ID)
        title: "Congratulations! You've Been Hired",
        message: `You have been hired for the ${jobTitle} position at ${companyName}.`,
        type: "success",
        link: `/jobseeker/application-details/${application._id}`,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    // Respond with success
    res.status(200).json({
      message:
        "Applicant has been hired successfully, and email notification sent.",
      application,
    });
  } catch (error) {
    console.error("Error hiring applicant:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// cancel hire
export const cancelHire = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "hired") {
      return res
        .status(400)
        .json({ message: "Only hired applications can be canceled" });
    }

    application.status = "interview completed"; // or another appropriate status
    await application.save();

    res.status(200).json({
      message: "Hire canceled successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// decline applicant
export const declineApplicant = async (req, res) => {
  const { applicationId } = req.params;
  const { remarks } = req.body;

  try {
    const application = await Application.findById(applicationId)
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId",
        populate: {
          path: "companyId",
          select: "companyInformation accountId",
        },
      })
      .populate({
        path: "jobSeekerId",
        select: "personalInformation accountId",
        populate: {
          path: "accountId",
          select: "emailAddress",
        },
      });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!remarks) {
      return res.status(400).json({
        message: "Remarks are required when declining an application",
      });
    }

    application.status = "declined";
    application.remarks = remarks;
    await application.save();

    // Extract relevant details for email
    const companyName =
      application.jobVacancyId?.companyId?.companyInformation?.businessName ||
      "Unknown Company";
    const jobTitle =
      application.jobVacancyId?.jobTitle || "Job Title Not Available";
    const applicantName =
      application?.jobSeekerId?.personalInformation?.firstName || "Applicant";
    const emailAddress =
      application?.jobSeekerId?.accountId?.emailAddress || ""; // Get the email address from accountId

    const emailContent = {
      to: emailAddress,
      subject: `Application for ${jobTitle} - Declined`,
      text: `Dear ${applicantName},\n\nWe regret to inform you that your application for the job position ${jobTitle} at ${companyName} has been declined.\n\nRemarks: ${remarks}\n\nThank you for your interest, and we wish you the best in your future endeavors.`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #FF4136; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">PESO City Government of Taguig</h1>
          </div>
          <h2 style="color: #2C3E50; text-align: center;">Application Declined</h2>
          <p>Dear ${applicantName},</p>
          <p>We regret to inform you that your application for the following job has been declined:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company Name:</strong> ${companyName}</li>
          </ul>
          <p><strong>Remarks:</strong> ${remarks}</p>
          <p style="margin-top: 20px;">Thank you for your interest, and we wish you the best in your future endeavors.</p>
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    // Send the email notification
    await sendEmail(emailContent);

    // Send in-app notification to job seeker
    try {
      await createNotification({
        to: application?.jobSeekerId?.accountId, // Receiver (Job Seeker's Account ID)
        from: application?.jobVacancyId?.companyId?.accountId, // Sender (Company ID)
        title: "Application Declined",
        message: `Unfortunately, your application for the ${jobTitle} position at ${companyName} has been declined.`,
        type: "error",
        link: `/jobseeker/application-details/${application._id}`,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    // Respond with success
    res.status(200).json({
      message:
        "Applicant has been declined successfully, and email notification sent.",
      application,
    });
  } catch (error) {
    console.error("Error declining applicant:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// get applicant statistics
export const getApplicantStatistics = async (req, res) => {
  try {
    // Get all applicants with necessary fields only
    const allApplicants = await Application.find()
      .populate({
        path: "jobSeekerId",
        select: "personalInformation.firstName",
      })
      .populate({
        path: "jobVacancyId",
        select: "jobTitle",
        populate: {
          path: "companyId",
          select: "companyInformation.businessName",
        },
      });

    // Filter applicants with the status "hired"
    const hiredApplicants = allApplicants.filter(
      (applicant) => applicant.status === "hired"
    );

    res.status(200).json({
      totalApplicants: allApplicants.length,
      applicants: allApplicants,
      totalHiredApplicants: hiredApplicants.length,
      hiredApplicants,
    });
  } catch (error) {
    console.error("Error fetching applicant statistics:", error);
    res.status(500).json({ message: "Failed to fetch applicant statistics." });
  }
};

// get hired applicants
export const getHiredApplicants = async (req, res) => {
  try {
    const hiredApplicants = await Application.find({ status: "hired" })
      .populate({
        path: "jobVacancyId",
        select: "jobTitle companyId",
        populate: {
          path: "companyId",
          select: "companyInformation.businessName",
        },
      })
      .populate(
        "jobSeekerId",
        "personalInformation.firstName personalInformation.middleName personalInformation.lastName personalInformation.photo"
      )
      .sort({ hiredDate: -1 }); // Sort by hiredDate in descending order;

    res.status(200).json({ success: true, hiredApplicants });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all applicants
export const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Application.find();
    res?.status(200).json({ success: true, applicants });
  } catch (error) {
    console.log(error);
    res
      ?.status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

export const getApplicationStatistics = async (req, res) => {
  try {
    // Optionally filter by employer if needed (assuming jobVacancy is associated with employer)
    const filter = {};

    // Get counts for each status
    const stats = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array to object with status as keys
    const result = {
      pending: 0,
      "interview scheduled": 0,
      "interview completed": 0,
      hired: 0,
      declined: 0,
      total: 0,
    };

    let total = 0;

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      total += stat.count;
    });

    result.total = total;

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getAllApplicationReports = async (req, res) => {
//   try {
//     const { year, month, status, businessName } = req.query;

//     // Base filter
//     const filter = {};

//     // Add status filter if provided
//     if (status) {
//       filter.status = status;
//     }

//     // Add business name filter if provided
//     if (businessName) {
//       // First find companies that match the business name
//       const companies = await Company.find({
//         "companyInformation.businessName": new RegExp(businessName, "i"),
//       }).select("_id");

//       const companyIds = companies.map((c) => c._id);

//       // Then find job vacancies from these companies
//       const jobVacancies = await JobVacancy.find({
//         companyId: { $in: companyIds },
//       }).select("_id");

//       const jobVacancyIds = jobVacancies.map((jv) => jv._id);
//       filter.jobVacancyId = { $in: jobVacancyIds };
//     }

//     // Add date filtering for year and/or month
//     if (year || month) {
//       filter.createdAt = {};

//       if (year) {
//         const startYear = new Date(`${year}-01-01`);
//         const endYear = new Date(`${parseInt(year) + 1}-01-01`);
//         filter.createdAt.$gte = startYear;
//         filter.createdAt.$lt = endYear;
//       }

//       if (month && year) {
//         const startMonth = new Date(`${year}-${month.padStart(2, "0")}-01`);
//         const endMonth = new Date(startMonth);
//         endMonth.setMonth(endMonth.getMonth() + 1);
//         filter.createdAt.$gte = startMonth;
//         filter.createdAt.$lt = endMonth;
//       } else if (month) {
//         // If month is provided without year, use current year
//         const currentYear = new Date().getFullYear();
//         const startMonth = new Date(
//           `${currentYear}-${month.padStart(2, "0")}-01`
//         );
//         const endMonth = new Date(startMonth);
//         endMonth.setMonth(endMonth.getMonth() + 1);
//         filter.createdAt.$gte = startMonth;
//         filter.createdAt.$lt = endMonth;
//       }
//     }

//     // Get application data with full details
//     const applications = await Application.aggregate([
//       { $match: filter },
//       {
//         $lookup: {
//           from: "jobseekers",
//           localField: "jobSeekerId",
//           foreignField: "_id",
//           as: "jobSeeker",
//         },
//       },
//       { $unwind: "$jobSeeker" },
//       {
//         $lookup: {
//           from: "jobvacancies",
//           localField: "jobVacancyId",
//           foreignField: "_id",
//           as: "jobVacancy",
//         },
//       },
//       { $unwind: "$jobVacancy" },
//       {
//         $lookup: {
//           from: "companies",
//           localField: "jobVacancy.companyId",
//           foreignField: "_id",
//           as: "company",
//         },
//       },
//       { $unwind: "$company" },
//       {
//         $project: {
//           status: 1,
//           jobSeekerId: 1, // Include job seeker ID
//           "jobSeeker.personalInformation.firstName": 1,
//           "jobSeeker.personalInformation.lastName": 1,
//           "jobSeeker.personalInformation.emailAddress": 1,
//           "jobSeeker.personalInformation.mobileNumber": 1,
//           "jobVacancy.jobTitle": 1,
//           "jobVacancy.department": 1,
//           "company.companyInformation.businessName": 1,
//           "company.companyInformation.industry": 1,
//           createdAt: 1,
//           updatedAt: 1,
//           hiredDate: 1,
//           hiredBy: 1,
//           remarks: 1,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     // Format report data
//     const reportData = applications.map((app) => ({
//       applicant: {
//         id: app.jobSeekerId, // Include job seeker ID in response
//         name: `${app.jobSeeker.personalInformation.firstName} ${app.jobSeeker.personalInformation.lastName}`,
//         email: app.jobSeeker.personalInformation.emailAddress,
//         phone: app.jobSeeker.personalInformation.mobileNumber,
//       },
//       job: {
//         title: app.jobVacancy.jobTitle,
//         department: app.jobVacancy.department,
//       },
//       company: {
//         businessName: app.company.companyInformation.businessName,
//         industry: app.company.companyInformation.industry,
//       },
//       application: {
//         status: app.status,
//         appliedDate: app.createdAt.toISOString().split("T")[0], // Format as YYYY-MM-DD
//         lastUpdated: app.updatedAt.toISOString().split("T")[0],
//         hiredDate: app.hiredDate
//           ? app.hiredDate.toISOString().split("T")[0]
//           : "N/A",
//         hiredBy: app.hiredBy || app.company.companyInformation.businessName,
//       },
//       remarks: app.remarks,
//     }));

//     // Generate summary statistics
//     const statusCounts = await Application.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const summary = {
//       total: applications.length,
//       statuses: statusCounts.reduce((acc, curr) => {
//         acc[curr._id] = curr.count;
//         return acc;
//       }, {}),
//       ...(businessName && {
//         hiringBusiness: businessName,
//         hiredCount: applications.filter((app) => app.status === "hired").length,
//       }),
//     };

//     res.status(200).json({
//       success: true,
//       summary,
//       filters: {
//         year: year || "All years",
//         month: month
//           ? new Date(2000, parseInt(month) - 1).toLocaleString("default", {
//               month: "long",
//             })
//           : "All months",
//         status: status || "All statuses",
//         businessName: businessName || "All businesses",
//       },
//       applications: reportData,
//       count: reportData.length,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate application report",
//       error: error.message,
//     });
//   }
// };

export const getAllApplicationReports = async (req, res) => {
  try {
    const {
      year,
      month,
      status,
      businessName,
      hasDisability,
      isSeniorCitizen,
    } = req.query;

    // Build the aggregation pipeline
    const pipeline = [];

    // Initial match for status if provided
    if (status) {
      pipeline.push({
        $match: { status },
      });
    }

    // Date filtering
    if (year || month) {
      const dateFilter = {};

      if (year) {
        const startYear = new Date(`${year}-01-01`);
        const endYear = new Date(`${parseInt(year) + 1}-01-01`);
        dateFilter.$gte = startYear;
        dateFilter.$lt = endYear;
      }

      if (month && year) {
        const startMonth = new Date(`${year}-${month.padStart(2, "0")}-01`);
        const endMonth = new Date(startMonth);
        endMonth.setMonth(endMonth.getMonth() + 1);
        dateFilter.$gte = startMonth;
        dateFilter.$lt = endMonth;
      } else if (month) {
        const currentYear = new Date().getFullYear();
        const startMonth = new Date(
          `${currentYear}-${month.padStart(2, "0")}-01`
        );
        const endMonth = new Date(startMonth);
        endMonth.setMonth(endMonth.getMonth() + 1);
        dateFilter.$gte = startMonth;
        dateFilter.$lt = endMonth;
      }

      pipeline.push({
        $match: { createdAt: dateFilter },
      });
    }

    // Lookup job seeker information
    pipeline.push({
      $lookup: {
        from: "jobseekers",
        localField: "jobSeekerId",
        foreignField: "_id",
        as: "jobSeeker",
      },
    });
    pipeline.push({ $unwind: "$jobSeeker" });

    // Calculate age and filter for senior citizens if requested
    // Replace the senior citizen filter part with this:
    // Replace the senior citizen filter part in your controller with this:
    if (isSeniorCitizen !== undefined && isSeniorCitizen !== "") {
      // Calculate the date threshold for 60 years ago
      const currentDate = new Date();
      const thresholdDate = new Date(
        currentDate.getFullYear() - 60,
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // Add this field first for clear debugging
      pipeline.push({
        $addFields: {
          birthDate: "$jobSeeker.personalInformation.birthDate",
          thresholdDate: thresholdDate, // For debugging
          isSeniorCitizen: {
            $cond: {
              if: {
                $lte: [
                  "$jobSeeker.personalInformation.birthDate",
                  thresholdDate,
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      });

      // Then filter based on it
      pipeline.push({
        $match: {
          isSeniorCitizen: isSeniorCitizen === "true",
        },
      });
    }

    // Apply disability filter if provided
    if (hasDisability !== undefined) {
      pipeline.push({
        $match: {
          "jobSeeker.disability.hasDisability": hasDisability === "true",
        },
      });
    }

    // Lookup job vacancy information
    pipeline.push({
      $lookup: {
        from: "jobvacancies",
        localField: "jobVacancyId",
        foreignField: "_id",
        as: "jobVacancy",
      },
    });
    pipeline.push({ $unwind: "$jobVacancy" });

    // Apply business name filter if provided
    if (businessName) {
      pipeline.push({
        $lookup: {
          from: "companies",
          localField: "jobVacancy.companyId",
          foreignField: "_id",
          as: "company",
        },
      });
      pipeline.push({ $unwind: "$company" });
      pipeline.push({
        $match: {
          "company.companyInformation.businessName": new RegExp(
            businessName,
            "i"
          ),
        },
      });
    } else {
      // Still need to lookup company info even if not filtering
      pipeline.push({
        $lookup: {
          from: "companies",
          localField: "jobVacancy.companyId",
          foreignField: "_id",
          as: "company",
        },
      });
      pipeline.push({ $unwind: "$company" });
    }

    // Project the fields we need
    pipeline.push({
      $project: {
        status: 1,
        jobSeekerId: 1,
        "jobSeeker.personalInformation.firstName": 1,
        "jobSeeker.personalInformation.lastName": 1,
        "jobSeeker.personalInformation.emailAddress": 1,
        "jobSeeker.personalInformation.mobileNumber": 1,
        "jobSeeker.personalInformation.birthDate": 1,
        "jobSeeker.disability.hasDisability": 1,
        "jobSeeker.disability.types": 1,
        "jobSeeker.disability.otherDescription": 1,
        "jobVacancy.jobTitle": 1,
        "jobVacancy.department": 1,
        "company.companyInformation.businessName": 1,
        "company.companyInformation.industry": 1,
        createdAt: 1,
        updatedAt: 1,
        hiredDate: 1,
        hiredBy: 1,
        remarks: 1,
      },
    });

    // Sort by creation date
    pipeline.push({ $sort: { createdAt: -1 } });

    // Execute the aggregation
    const applications = await Application.aggregate(pipeline);

    // Format report data
    const reportData = applications.map((app) => {
      const birthDate = app.jobSeeker.personalInformation.birthDate;
      const age = birthDate
        ? new Date().getFullYear() - new Date(birthDate).getFullYear()
        : null;

      return {
        applicant: {
          id: app.jobSeekerId,
          name: `${app.jobSeeker.personalInformation.firstName} ${app.jobSeeker.personalInformation.lastName}`,
          email: app.jobSeeker.personalInformation.emailAddress,
          phone: app.jobSeeker.personalInformation.mobileNumber,
          birthDate: birthDate ? birthDate.toISOString().split("T")[0] : "N/A",
          age: age,
          isSeniorCitizen: age >= 60,
          hasDisability: app.jobSeeker.disability?.hasDisability || false,
          disabilityTypes: app.jobSeeker.disability?.types || [],
          otherDisabilityDescription:
            app.jobSeeker.disability?.otherDescription || "",
        },
        job: {
          title: app.jobVacancy.jobTitle,
          department: app.jobVacancy.department,
        },
        company: {
          businessName: app.company.companyInformation.businessName,
          industry: app.company.companyInformation.industry,
        },
        application: {
          status: app.status,
          appliedDate: app.createdAt.toISOString().split("T")[0],
          lastUpdated: app.updatedAt.toISOString().split("T")[0],
          hiredDate: app.hiredDate
            ? app.hiredDate.toISOString().split("T")[0]
            : "N/A",
          hiredBy: app.hiredBy || app.company.companyInformation.businessName,
        },
        remarks: app.remarks,
      };
    });

    // Generate summary statistics
    const summaryPipeline = [...pipeline];

    // Remove sorting and projection for counting
    summaryPipeline.pop(); // Remove sort
    summaryPipeline.pop(); // Remove project

    // Add status counting
    summaryPipeline.push({
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    });

    const statusCounts = await Application.aggregate(summaryPipeline);

    // Count disability stats
    const disabilityPipeline = [...pipeline];
    disabilityPipeline.pop(); // Remove sort
    disabilityPipeline.pop(); // Remove project

    disabilityPipeline.push({
      $group: {
        _id: "$jobSeeker.disability.hasDisability",
        count: { $sum: 1 },
      },
    });

    const disabilityCount = await Application.aggregate(disabilityPipeline);

    // Count senior citizen stats
    // Replace the senior count pipeline with this:
    const seniorPipeline = [
      ...pipeline.filter((stage) => !stage.$sort && !stage.$project),
    ];

    // Add birthdate and age calculation
    seniorPipeline.push({
      $addFields: {
        currentDate: new Date(),
        thresholdDate: new Date(
          new Date().getFullYear() - 60,
          new Date().getMonth(),
          new Date().getDate()
        ),
        isSeniorCitizen: {
          $cond: {
            if: {
              $lte: [
                "$jobSeeker.personalInformation.birthDate",
                new Date(
                  new Date().getFullYear() - 60,
                  new Date().getMonth(),
                  new Date().getDate()
                ),
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    });

    // Group by senior citizen status
    seniorPipeline.push({
      $group: {
        _id: "$isSeniorCitizen",
        count: { $sum: 1 },
      },
    });

    const seniorCount = await Application.aggregate(seniorPipeline);

    // Format the summary with safer defaults
    const summary = {
      total: applications.length,
      statuses: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      disabilityStats: disabilityCount.reduce(
        (acc, curr) => {
          acc[curr._id ? "withDisability" : "withoutDisability"] = curr.count;
          return acc;
        },
        { withDisability: 0, withoutDisability: 0 }
      ),
      seniorCitizenStats: seniorCount.reduce(
        (acc, curr) => {
          acc[curr._id ? "isSeniorCitizen" : "notSeniorCitizen"] = curr.count;
          return acc;
        },
        { isSeniorCitizen: 0, notSeniorCitizen: 0 }
      ),
    };

    res.status(200).json({
      success: true,
      summary,
      filters: {
        year: year || "All years",
        month: month
          ? new Date(2000, parseInt(month) - 1).toLocaleString("default", {
              month: "long",
            })
          : "All months",
        status: status || "All statuses",
        businessName: businessName || "All businesses",
        hasDisability:
          hasDisability !== undefined
            ? hasDisability === "true"
              ? "Yes"
              : "No"
            : "All",
        isSeniorCitizen:
          isSeniorCitizen !== undefined
            ? isSeniorCitizen === "true"
              ? "Yes"
              : "No"
            : "All",
      },
      applications: reportData,
      count: reportData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate application report",
      error: error.message,
    });
  }
};

// Get unique business names for filter dropdown
export const getBusinessNames = async (req, res) => {
  try {
    const businessNames = await Company.aggregate([
      {
        $match: {
          "companyInformation.businessName": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$companyInformation.businessName",
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          name: "$_id",
          _id: 0,
        },
      },
    ]);

    if (!businessNames.length) {
      return res.status(404).json({
        success: false,
        message: "No business names found",
      });
    }

    res.status(200).json(businessNames);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch business names",
      error: error.message,
    });
  }
};
