import JobVacancy from "../models/jobVacancy.model.js";
import JobSeeker from "../models/jobSeeker.model.js";
import Company from "../models/company.model.js";
import { auditTrail } from "../utils/auditTrail.js";
import JobInvitation from "../models/jobInvitation.model.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notification.js";
import { io, userSocketMap } from "../index.js";
import { Account } from "../models/account.model.js";
import JobFairEvent from "../models/jobFairEvent.js";
import JobFairPreregistration from "../models/jobFairPreRegistration.js";
import JobFairAttendance from "../models/jobFairAttendance.js";
import QRCode from "qrcode";
import crypto from "crypto";

// post a job vacancy
export const postJobVacancy = async (req, res) => {
  const accountId = req.accountId;
  const companyId = req.companyId;

  const {
    jobTitle,
    description,
    salaryType,
    salaryMin,
    salaryMax,
    vacancies,
    requiredQualifications,
    employmentType,
    workLocation,
    applicationDeadline,
    responsibilities,
    skillsRequired,
    interviewProcess,
    industry, // Added industry field
  } = req.body;

  try {
    // Convert applicationDeadline to ISO format if it's in YYYY-MM-DD format
    let formattedDeadline = applicationDeadline;
    if (applicationDeadline) {
      formattedDeadline = new Date(applicationDeadline).toISOString();
    }

    // Check if salaryMax is greater than salaryMin
    if (salaryMax <= salaryMin) {
      return res.status(400).json({
        message: "Maximum salary must be greater than minimum salary.",
      });
    }

    // Find the company by companyId
    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(400)
        .json({ success: false, message: "Company not found!" });
    }

    // Create a new job vacancy
    const newJob = await JobVacancy.create({
      accountId,
      companyId,
      jobTitle,
      description,
      salaryType,
      salaryMin,
      salaryMax,
      vacancies,
      requiredQualifications,
      employmentType,
      workLocation,
      applicationDeadline: formattedDeadline,
      responsibilities,
      skillsRequired,
      interviewProcess,
      industry, // Include industry field
    });

    // Add the new job to the company's jobVacancies array
    company.jobVacancies.push(newJob._id);
    await company.save();

    // **Send Notification to All System Users (Admin & Staff)**
    try {
      const systemUsers = await Account.find({
        role: { $in: ["admin", "staff"] },
      });

      console.log("System users found:", systemUsers.length);

      for (const account of systemUsers) {
        console.log(`Sending notification to: ${account._id}`);

        await createNotification({
          to: account._id, // Notify each admin and staff individually
          from: accountId, // Company’s account ID (not companyId)
          title: "New Pending Job Vacancies",
          message: `${company?.companyInformation?.businessName} has uploaded new job vacancy. Please review them for approval.`,
          type: "info",
          link: `/admin/company-verification/${companyId}`,
        });
      }
      console.log("Notifications sent successfully.");
    } catch (error) {
      console.error("Error creating notifications for system users:", error);
    }

    // Respond with the created job vacancy
    return res.status(201).json({
      success: true,
      message: "Job vacancy created successfully.",
      data: newJob,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a job vacancy with this job position.",
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the job vacancy.",
    });
  }
};

// get all job vacancies
export const getAllJobVacancies = async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Default to page 1 and limit 5

  try {
    // Fetch job vacancies with pagination
    const jobVacancies = await JobVacancy.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("companyId")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get total count of job vacancies
    const total = await JobVacancy.countDocuments();

    return res.status(200).json({
      success: true,
      jobVacancies,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// get all employer job vacancies
export const getAllEmployerJobVacancies = async (req, res) => {
  try {
    const companyId = req.companyId;
    const jobVacancies = await JobVacancy.find({ companyId })
      .populate("companyId")
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order

    res.status(200).json({ success: true, jobVacancies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const getAllEmployerJobVacanciesByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const jobVacancies = await JobVacancy.find({ companyId })
      .populate("companyId")
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order

    res.status(200).json({ success: true, jobVacancies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// get single job
export const getSingleJobVacancy = async (req, res) => {
  const { jobVacancyId } = req.params;
  try {
    const jobVacancy = await JobVacancy.findById(jobVacancyId).populate(
      "companyId"
    );
    res.status(200).json({ success: true, jobVacancy });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// search job vacancies
export const searchJobVacancies = async (req, res) => {
  try {
    const { jobTitle, employmentType, salaryMin, salaryMax, salaryType } =
      req.query;

    // Search query using a custom index name
    const searchQuery = jobTitle
      ? {
          $search: {
            index: "job_vacancy_index",
            text: {
              query: jobTitle,
              path: "jobTitle",
              fuzzy: { maxEdits: 2 },
            },
          },
        }
      : {};

    // Define the aggregation pipeline
    const pipeline = [
      searchQuery, // Add the search query stage if jobTitle is provided
      ...(employmentType && employmentType !== "all"
        ? [
            {
              $match: {
                employmentType,
              },
            },
          ]
        : []), // Filter by employmentType if provided
      ...(salaryType && salaryType !== "all"
        ? [
            {
              $match: {
                salaryType,
              },
            },
          ]
        : []), // Filter by salaryType if provided
      ...(salaryMin || salaryMax
        ? [
            {
              $match: {
                ...(salaryMin && { salaryMin: { $gte: Number(salaryMin) } }),
                ...(salaryMax && { salaryMax: { $lte: Number(salaryMax) } }),
              },
            },
          ]
        : []), // Filter by salary range if provided
      {
        $lookup: {
          from: "companies", // The name of the collection you're joining with
          localField: "companyId", // The field in JobVacancy
          foreignField: "_id", // The field in the Company collection
          as: "companyInfo", // The name of the array field to hold the populated company info
        },
      },
      {
        $unwind: {
          path: "$companyInfo", // Unwind the populated companyInfo array to make it a single object
          preserveNullAndEmptyArrays: true, // Keep the vacancy even if there is no matching company
        },
      },
      {
        $match: {
          "companyInfo.status": "accredited", // Only include job posts from companies with "accredited" status
          publicationStatus: { $in: ["approved", "expired"] }, // Only include job posts with "approved" or "expired" publicationStatus
        },
      },
    ];

    // Execute the aggregation query
    const jobVacancies = await JobVacancy.aggregate(pipeline);

    res.status(200).json(jobVacancies);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error while searching for job vacancies" });
  }
};

// save jobs
export const saveJobVacancy = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const { jobVacancyId } = req.params;

    // Check if job vacancy exists
    const jobVacancy = await JobVacancy.findById(jobVacancyId);
    if (!jobVacancy) {
      return res
        .status(400)
        .json({ success: false, message: "Job vacancy does not exist!" });
    }

    // Check if job seeker exists
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res
        .status(400)
        .json({ success: false, message: "Job seeker does not exist!" });
    }

    // Check if the job vacancy is already saved
    if (jobSeeker.savedJobVacancies.includes(jobVacancyId)) {
      return res
        .status(400)
        .json({ success: false, message: "Job vacancy already saved!" });
    }

    // Push the job vacancy ID into the savedJobVacancies array
    jobSeeker.savedJobVacancies.push(jobVacancyId);
    await jobSeeker.save();

    res.status(200).json({
      success: true,
      message: "Job vacancy saved successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// delete saved job
export const deleteSavedJobVancancy = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId; // Get the JobSeeker ID from the request (e.g., from auth middleware)
    const { jobVacancyId } = req.params; // Get the jobVacancyId from the request parameters

    // Check if the job vacancy exists
    const jobVacancy = await JobVacancy.findById(jobVacancyId);
    if (!jobVacancy) {
      return res.status(400).json({
        success: false,
        message: "Job vacancy does not exist!",
      });
    }

    // Find the JobSeeker and remove the job vacancy from their saved list
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(400).json({
        success: false,
        message: "Job seeker does not exist!",
      });
    }

    // Check if the job vacancy is already saved
    const isJobVacancySaved =
      jobSeeker.savedJobVacancies.includes(jobVacancyId);
    if (!isJobVacancySaved) {
      return res.status(400).json({
        success: false,
        message: "Job vacancy is not saved!",
      });
    }

    // Remove the job vacancy from the saved list
    jobSeeker.savedJobVacancies = jobSeeker.savedJobVacancies.filter(
      (savedJob) => savedJob.toString() !== jobVacancyId
    );

    // Save the updated JobSeeker document
    await jobSeeker.save();

    res.status(200).json({
      success: true,
      message: "Job vacancy removed from saved list!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// get all saved jobs
export const getAllSavedJobVacancies = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeeker = await JobSeeker.findById(jobSeekerId)
      .populate({
        path: "savedJobVacancies",
        populate: {
          path: "companyId",
          model: "Company", // Ensure this matches your Company model name
        },
      })
      .sort({ createdAt: -1 });
    if (!jobSeeker) {
      return res
        .status(400)
        .json({ success: false, message: "Job seeker ID not found!" });
    }
    res
      .status(200)
      .json({ success: true, savedJobVacancies: jobSeeker.savedJobVacancies });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get recommended job vacancies
export const getRecommendedJobVacancies = async (req, res) => {
  const {
    jobPositions,
    locations,
    salaryMin,
    salaryMax,
    employmentType,
    salaryType,
    industries,
  } = req.body;

  // Ensure industries are provided
  if (!industries || industries.length === 0) {
    return res
      .status(400)
      .json({ message: "Industry must be specified to get recommendations." });
  }

  try {
    // Sanitize inputs
    const sanitizedJobPositions =
      jobPositions && jobPositions.length > 0 ? jobPositions : [];
    const sanitizedLocations =
      locations && locations.length > 0 ? locations : [];
    const sanitizedIndustries = industries;

    const pipeline = [
      {
        $search: {
          index: "job_vacancy_index",
          compound: {
            must: [
              {
                text: {
                  query: sanitizedIndustries,
                  path: "industry",
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 3 } }, // Higher weight for industry match
                },
              },
            ],
            should: [
              ...(sanitizedJobPositions.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedJobPositions,
                        path: "jobTitle",
                        fuzzy: { maxEdits: 1 },
                        score: { boost: { value: 2 } }, // Medium weight for job title match
                      },
                    },
                  ]
                : []),
              ...(sanitizedLocations.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedLocations,
                        path: "workLocation",
                        fuzzy: { maxEdits: 1 },
                        score: { boost: { value: 1 } }, // Lower weight for location match
                      },
                    },
                  ]
                : []),
              ...(employmentType
                ? [
                    {
                      text: {
                        query: employmentType,
                        path: "employmentType",
                        fuzzy: { maxEdits: 1 },
                        score: { boost: { value: 1.5 } }, // Medium weight for employment type match
                      },
                    },
                  ]
                : []),
              ...(salaryType
                ? [
                    {
                      text: {
                        query: salaryType,
                        path: "salaryType",
                        fuzzy: { maxEdits: 1 },
                        score: { boost: { value: 1.5 } }, // Medium weight for salary type match
                      },
                    },
                  ]
                : []),
            ],
            minimumShouldMatch: 0,
          },
        },
      },
      {
        $match: {
          $and: [
            { industry: { $in: sanitizedIndustries } },
            { publicationStatus: { $in: ["approved", "expired"] } }, // Filter by publicationStatus
          ],
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      {
        $unwind: {
          path: "$companyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "companyDetails.status": "accredited", // Only include job posts from companies with "accredited" status
        },
      },
      {
        $addFields: {
          searchScore: { $meta: "searchScore" },
          jobPositionMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $cond: {
                    if: { $isArray: "$jobTitle" },
                    then: "$jobTitle",
                    else: [{ $ifNull: ["$jobTitle", ""] }],
                  },
                },
                sanitizedJobPositions,
              ],
            },
          },
          locationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $cond: {
                    if: { $isArray: "$workLocation" },
                    then: "$workLocation",
                    else: [{ $ifNull: ["$workLocation", ""] }],
                  },
                },
                sanitizedLocations,
              ],
            },
          },
          industryMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $cond: {
                    if: { $isArray: "$industry" },
                    then: "$industry",
                    else: [{ $ifNull: ["$industry", ""] }],
                  },
                },
                sanitizedIndustries,
              ],
            },
          },
          employmentTypeMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $cond: {
                    if: { $isArray: "$employmentType" },
                    then: "$employmentType",
                    else: [{ $ifNull: ["$employmentType", ""] }],
                  },
                },
                [employmentType],
              ],
            },
          },
          salaryTypeMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $cond: {
                    if: { $isArray: "$salaryType" },
                    then: "$salaryType",
                    else: [{ $ifNull: ["$salaryType", ""] }],
                  },
                },
                [salaryType],
              ],
            },
          },
          salaryRangeMatch: {
            $cond: {
              if: {
                $and: [
                  { $gte: ["$salaryMin", salaryMin] },
                  { $lte: ["$salaryMax", salaryMax] },
                ],
              },
              then: 1, // Full score if within range
              else: 0.5, // Half score if outside range
            },
          },
        },
      },
      {
        $addFields: {
          adjustedScore: {
            $add: [
              "$searchScore",
              { $multiply: ["$jobPositionMatchCount", 2] }, // Job position matches add 2 to the score
              { $multiply: ["$locationMatchCount", 1.5] }, // Location matches add 1.5 to the score
              { $multiply: ["$industryMatchCount", 3] }, // Industry matches add 3 to the score
              { $multiply: ["$employmentTypeMatchCount", 1.5] }, // Employment type matches add 1.5 to the score
              { $multiply: ["$salaryTypeMatchCount", 1.5] }, // Salary type matches add 1.5 to the score
              { $multiply: ["$salaryRangeMatch", 2] }, // Salary range matches add 2 to the score
            ],
          },
        },
      },
      {
        $sort: {
          adjustedScore: -1, // Sort by the adjusted score
        },
      },
      {
        $limit: 10, // Limit to top 10 recommendations
      },
      {
        $project: {
          jobTitle: 1,
          workLocation: 1,
          salaryMin: 1,
          salaryMax: 1,
          employmentType: 1, // Include employmentType in the results
          salaryType: 1, // Include salaryType in the results
          description: 1,
          companyId: 1,
          companyLogo: "$companyDetails.companyInformation.companyLogo",
          companyName: "$companyDetails.companyInformation.businessName",
          industry: "$companyDetails.industry",
          applicants: 1,
          vacancies: 1,
          adjustedScore: 1,
        },
      },
    ];

    // Execute the aggregation pipeline
    const results = await JobVacancy.aggregate(pipeline);

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching jobs found." });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch job recommendations." });
  }
};

// get all job vacancies for admin
export const getAllJobVacanciesAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter =
      status && status !== "all" ? { publicationStatus: status } : {};

    // Fetch job vacancies and statistics concurrently
    const [jobVacancies, stats] = await Promise.all([
      JobVacancy.find(filter).populate("companyId"),
      JobVacancy.aggregate([
        {
          $group: {
            _id: "$publicationStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format stats into a consistent object
    const statsFormatted = stats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count; // Assign count to the corresponding status
        acc.all += count; // Increment the total count
        return acc;
      },
      { pending: 0, approved: 0, declined: 0, all: 0 } // Default values
    );

    res.status(200).json({
      success: true,
      jobVacancies,
      stats: statsFormatted,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// Approve a job vacancy
export const approveJobVacancy = async (req, res) => {
  const accountId = req.accountId;

  try {
    const { jobVacancyId } = req.params;

    const findJobVacancy = await JobVacancy.findById(jobVacancyId);

    if (findJobVacancy.publicationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "This job vacancy is already approved!",
      });
    }

    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { publicationStatus: "approved" },
      { new: true }
    ).populate([
      {
        path: "accountId",
        select: "emailAddress firstName lastName",
      },
      {
        path: "companyId",
        select: "companyInformation.businessName",
      },
    ]);

    // Audit trail for successful approval
    await auditTrail({
      accountId,
      action: "approved job vacancy",
      details: {
        jobTitle: jobVacancy.jobTitle,
        companyName: jobVacancy.companyId?.companyInformation?.businessName,
        newStatus: "approved",
      },
    });

    const emailContent = {
      to: jobVacancy?.accountId?.emailAddress, // Send to the email associated with the company
      subject: `Job Vacancy Approved: ${jobVacancy?.jobTitle}`,
      text: `Dear ${jobVacancy?.companyName || "Company"},
      
    We are pleased to inform you that your job vacancy titled "${
      jobVacancy?.jobTitle
    }" has been approved and is now published on our platform.
    
    You can view the approved listing and manage applications by logging into your account.
    
    Thank you for choosing the City Government of Taguig as your partner in connecting with skilled professionals.
    
    Best regards,
    City Government of Taguig`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #4CAF50; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PESO City Government of Taguig</h1>
          </div>
        
          <h2 style="color: #2C3E50; text-align: center; margin-top: 20px; font-size: 22px;">Job Vacancy Approved</h2>
        
          <p style="font-size: 16px;">Dear ${
            jobVacancy?.companyId?.companyInformation?.businessName || "Company"
          },</p>
        
          <p style="font-size: 16px;">We are pleased to inform you that your job vacancy titled "<strong>${
            jobVacancy?.jobTitle
          }</strong>" has been approved and is now published on our platform.</p>
        
          <p style="font-size: 16px;">You can view the approved listing and manage applications by logging into your account.</p>
        
          <p style="text-align: center; margin-top: 20px;">
            <a href="https://your-platform-url.com/manage-vacancies" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Manage Vacancies</a>
          </p>
        
          <p style="font-size: 16px; text-align: center; margin-top: 30px;">
            <strong>Best regards,</strong><br/>
            City Government of Taguig
          </p>
        
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    await sendEmail(emailContent);

    // Notify the employer
    try {
      await createNotification({
        to: jobVacancy?.accountId?._id,
        from: accountId,
        title: "Job Vacancy Approved",
        message: `Your job vacancy, ${jobVacancy?.jobTitle}, has been approved.`,
        type: "success",
      });

      res.status(200).json({ message: "Job vacancy approved", jobVacancy });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Decline a job vacancy
export const declineJobVacancy = async (req, res) => {
  try {
    const accountId = req.accountId;
    const { jobVacancyId } = req.params;
    const { reason } = req.body;

    const findJobVacancy = await JobVacancy.findById(jobVacancyId);

    if (findJobVacancy.publicationStatus === "declined") {
      return res.status(400).json({
        success: false,
        message: "This job vacancy is already declined!",
      });
    }

    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { publicationStatus: "declined", remarks: reason },
      { new: true }
    ).populate([
      {
        path: "accountId",
        select: "emailAddress firstName lastName",
      },
      {
        path: "companyId",
        select: "companyInformation.businessName",
      },
    ]);

    if (!jobVacancy) {
      return res.status(404).json({ message: "Job vacancy not found" });
    }

    // Save activity
    // Audit trail for successful approval
    await auditTrail({
      accountId,
      action: "declined job vacancy",
      details: {
        jobTitle: jobVacancy.jobTitle,
        companyName: jobVacancy.companyId?.companyInformation?.businessName,
        newStatus: "declined",
      },
    });

    const emailContent = {
      to: jobVacancy?.accountId?.emailAddress, // Recipient's email
      subject: `Job Vacancy Declined: ${jobVacancy?.jobTitle}`,
      text: `Dear ${jobVacancy?.companyInformation?.businessName || "Company"},
      
    We regret to inform you that your job vacancy titled "${
      jobVacancy?.jobTitle
    }" has been declined. Below is the reason provided:
    
    Reason: ${jobVacancy?.remarks || "No specific reason provided."}
    
    If you wish to address the issue or make updates, please update your job vacancy and resubmit it for review.
    
    Thank you for your understanding.
    
    Best regards,  
    City Government of Taguig`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #f44336; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PESO City Government of Taguig</h1>
          </div>
          
          <h2 style="color: #2C3E50; text-align: center; margin-top: 20px; font-size: 22px;">Job Vacancy Declined</h2>
          
          <p style="font-size: 16px;">Dear ${
            jobVacancy?.companyInformation?.businessName || "Company"
          },</p>
          
          <p style="font-size: 16px;">We regret to inform you that your job vacancy titled "<strong>${
            jobVacancy?.jobTitle
          }</strong>" has been declined for the following reason:</p>
          
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-left: 5px solid #f44336; border-radius: 5px; margin: 15px 0;">
            <strong>Reason:</strong> ${
              jobVacancy?.remarks || "No specific reason provided."
            }
          </div>
          
          <p style="font-size: 16px;">If you wish to address the issue or make updates, you may update your job vacancy and resubmit it for review. We encourage you to ensure all details are accurate and comply with the required standards.</p>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="" style="background-color: #f44336; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Job Vacancy</a>
          </p>
          
          <p style="font-size: 16px; text-align: center; margin-top: 30px;">
            <strong>Best regards,</strong><br/>
            City Government of Taguig
          </p>
          
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig
          </p>
        </div>
      `,
    };

    // Send decline email
    await sendEmail({
      to: jobVacancy.accountId.emailAddress,
      subject: `Job Vacancy Declined: ${jobVacancy.title}`,
      text: `Dear ${
        jobVacancy.companyName || "Company"
      },\n\nWe regret to inform you...`, // Use the dynamic text
      html: emailContent.html, // Use the HTML content
    });

    try {
      await createNotification({
        to: jobVacancy?.accountId?._id,
        from: accountId,
        title: "Job Vacancy Declined",
        message: `Your job vacancy, ${jobVacancy?.jobTitle}, has been declined.`,
        type: "error",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    res.status(200).json({ message: "Job vacancy declined", jobVacancy });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// archive job vacancy
export const archiveJobVacancy = async (req, res) => {
  const { jobVacancyId } = req.params;

  try {
    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { status: "archived" },
      { new: true }
    );

    if (!jobVacancy) {
      return res.status(404).json({ message: "Job vacancy not found" });
    }

    res
      .status(200)
      .json({ message: "Job vacancy archived successfully", jobVacancy });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// unarchive job vacancy
export const unarchiveJobVacancy = async (req, res) => {
  const { jobVacancyId } = req.params;

  try {
    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { status: "ongoing" },
      { new: true }
    );

    if (!jobVacancy) {
      return res.status(404).json({ message: "Job vacancy not found" });
    }

    res
      .status(200)
      .json({ message: "Job vacancy unarchived successfully", jobVacancy });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// send job invitation
export const sendJobInvitation = async (req, res) => {
  const companyId = req.companyId;
  const { jobVacancyId } = req.body;
  const { jobSeekerId } = req.params;

  try {
    // Validate input
    if (!companyId || !jobVacancyId || !jobSeekerId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if the job vacancy exists
    const jobVacancy = await JobVacancy.findOne({
      _id: jobVacancyId,
      companyId: companyId,
    }).populate({
      path: "companyId",
      select: "companyInformation accountId",
    });

    if (!jobVacancy) {
      return res.status(404).json({
        message: "Job vacancy not found or not owned by the company.",
      });
    }

    // Check if the job seeker exists
    const jobSeeker = await JobSeeker.findById(jobSeekerId).populate({
      path: "accountId",
      select: "emailAddress personalInformation",
    });

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found." });
    }

    // **Check if the job invitation already exists**
    const existingInvitation = await JobInvitation.findOne({
      jobSeekerId,
      jobVacancyId,
    });

    if (existingInvitation) {
      return res.status(400).json({
        message: `Job seeker is already invited to the job title: ${jobVacancy.jobTitle}.`,
      });
    }

    // **Insert only if no existing record**
    const invitation = await JobInvitation.create({
      jobSeekerId,
      jobVacancyId,
      companyId,
    });

    // Send Email
    const email = jobSeeker?.accountId?.emailAddress;
    const companyName =
      jobVacancy?.companyId?.companyInformation?.businessName || "Company Name";
    const jobTitle = jobVacancy?.jobTitle || "Job Title";

    const emailContent = {
      to: email,
      subject: `Job Invitation for ${jobTitle} at ${companyName}`,
      text: `Dear ${jobSeeker?.personalInformation?.firstName},
      
      You have been invited to apply for the job position: ${jobTitle} at ${companyName}.
      
      Company Name: ${companyName}
      
      For more details, visit our portal.
      
      Best regards,
      PESO City Government of Taguig`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2C3E50;">You're Invited to Apply!</h2>
        <p>Dear ${jobSeeker?.personalInformation?.firstName},</p>
        <p>We are pleased to invite you to apply for the following job position:</p>
        <ul>
          <li><strong>Job Title:</strong> ${jobTitle}</li>
          <li><strong>Company Name:</strong> ${companyName}</li>
        </ul>
        <p><a href="https://yourjobportal.com" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Job Details</a></p>
        <p>© 2025 | City Government of Taguig</p>
      </div>`,
    };

    await sendEmail(emailContent);

    // **Create Notification**
    try {
      await createNotification({
        to: jobSeeker.accountId,
        from: jobVacancy.companyId.accountId,
        title: "New Job Invitation Received",
        message: `You have been invited to apply for the ${jobTitle} position at ${companyName}.`,
        type: "info",
        link: `/jobseeker/job-vacancy-details/${invitation.jobVacancyId}`,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    // Emit real-time notification to the job seeker
    const socketId = userSocketMap[jobSeeker.accountId._id];

    if (socketId) {
      io.to(socketId).emit("newInvitation", {
        message: `You have received a new job invitation for the position: ${jobVacancy?.jobTitle} at ${companyName}.`,
      });
    } else {
      console.log(
        "Job seeker is offline; the job invitation notification is saved in the database."
      );
    }

    // Respond with success
    res.status(201).json({
      message: "Job invitation sent successfully.",
      invitation,
    });
  } catch (error) {
    console.error("Error sending job invitation:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// get all employers job invitations
export const getAllEmployerJobInvitations = async (req, res) => {
  const companyId = req.companyId;
  try {
    const invitations = await JobInvitation.find({ companyId })
      .populate({
        path: "jobSeekerId",
        select:
          "personalInformation.firstName personalInformation.lastName personalInformation.photo",
      })
      .populate({
        path: "jobVacancyId",
        select: "jobTitle",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, invitations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all job seeker job invitations
export const getAllJobSeekerJobInvitations = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const invitations = await JobInvitation.find({ jobSeekerId })
      .populate({
        path: "companyId",
        select:
          "companyInformation.businessName companyInformation.companyLogo",
      })
      .populate({
        path: "jobSeekerId",
        select: "jobSeekerInformation.firstName jobSeekerInformation.lastName",
      })
      .populate({
        path: "jobVacancyId",
        select: "jobTitle",
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, invitations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// Controller to delete a job invitation
export const deleteJobInvitation = async (req, res) => {
  const { invitationId } = req.params;

  try {
    // Find and delete the job invitation by its ID
    const deletedInvitation = await JobInvitation.findByIdAndDelete(
      invitationId
    );

    if (!deletedInvitation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Invitation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update job vacancy
export const updateJobVacancy = async (req, res) => {
  try {
    console.log("reaching here...");
    const { jobVacancyId } = req.params;

    // Extract and convert salary values to integers
    const formData = {
      ...req.body,
      salaryMin: parseInt(req.body.salaryMin),
      salaryMax: parseInt(req.body.salaryMax),
    };

    const {
      jobTitle,
      employmentType,
      workLocation,
      vacancies,
      salaryType,
      salaryMin,
      salaryMax,
      description,
      industry,
      requiredQualifications,
      responsibilities,
      skillsRequired,
      applicationDeadline,
      interviewProcess,
    } = formData;

    // Validate employment type
    const validEmploymentTypes = [
      "permanent",
      "part-time",
      "temporary",
      "contractual",
    ];
    if (!validEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employment type",
      });
    }

    // Validate salary type
    const validSalaryTypes = ["hourly", "monthly"];
    if (!validSalaryTypes.includes(salaryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid salary type",
      });
    }

    // Validate salary values are valid integers
    if (isNaN(salaryMin) || isNaN(salaryMax)) {
      return res.status(400).json({
        success: false,
        message: "Salary values must be valid numbers",
      });
    }

    // Check if job vacancy exists
    const existingJobVacancy = await JobVacancy.findById(jobVacancyId);
    if (!existingJobVacancy) {
      return res.status(404).json({
        success: false,
        message: "Job vacancy not found",
      });
    }

    // Update job vacancy with converted values
    const updatedJobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      {
        jobTitle,
        employmentType,
        workLocation,
        vacancies: parseInt(vacancies),
        salaryType,
        salaryMin,
        salaryMax,
        description,
        industry,
        requiredQualifications,
        responsibilities,
        skillsRequired,
        applicationDeadline,
        interviewProcess,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Job vacancy updated successfully",
      jobVacancy: updatedJobVacancy,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the job vacancy",
      error: error.message,
    });
  }
};

// create job fair event
export const createJobFairEvent = async (req, res) => {
  try {
    const { title, date, venue, time, description, registrationDeadline } =
      req.body;

    // Check: Verify no duplicate event (same title + date)
    const existingEvent = await JobFairEvent.findOne({
      title,
      date: { $eq: new Date(date) },
    });
    if (existingEvent) {
      return res.status(400).json({
        success: false,
        error: "An event with this title and date already exists",
      });
    }

    const activeEventExists = await JobFairEvent.findOne({ isActive: true });
    if (activeEventExists) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot create new event while another event is still active. Please deactivate the current event first.",
      });
    }

    // Create new event
    const newEvent = new JobFairEvent({
      title,
      date,
      time,
      venue,
      description,
      registrationDeadline,
      // Defaults will be applied:
      // registeredJobSeekers: []
      // registeredEmployers: []
      // isActive: true
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Job fair event created successfully",
      data: savedEvent,
    });
  } catch (error) {
    console.error("Error creating job fair event:", error);
    res.status(500).json({
      success: false,
      error: "Server error. Could not create job fair event.",
    });
  }
};

export const getActiveJobFairEvent = async (req, res) => {
  try {
    const activeJobFair = await JobFairEvent.findOne({ isActive: true });
    if (!activeJobFair) {
      return res
        .status(404)
        .json({ success: false, message: "No active job fair event found." });
    }

    res.status(200).json({ success: true, activeJobFair });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

export const deleteJobFairEvent = async (req, res) => {
  try {
    const { jobFairEventId } = req.params;

    // Permanent deletion
    const deletedEvent = await JobFairEvent.findByIdAndDelete(jobFairEventId);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        error: "Job fair event not found",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Job fair event permanently deleted",
      data: {
        id: deletedEvent._id,
        title: deletedEvent.title,
        date: deletedEvent.date,
      },
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during deletion",
    });
  }
};

export const getAllJobFairEvents = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    // Build the query object
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter (now matches the model's isActive boolean)
    if (isActive !== undefined) {
      query.isActive = isActive === "true"; // Convert string 'true'/'false' to boolean
    }

    // Get events with filters
    const events = await JobFairEvent.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const updateJobFairEvent = async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      venue,
      description,
      registrationDeadline,
      isActive,
    } = req.body;

    // Find the event first to ensure it exists
    let event = await JobFairEvent.findById(req.params.jobFairEventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Prepare update object with only the fields that are passed in
    const updateFields = {};
    if (title) updateFields.title = title;
    if (date) updateFields.date = date;
    if (time) updateFields.time = time;
    if (venue) updateFields.venue = venue;
    if (description) updateFields.description = description;
    if (registrationDeadline)
      updateFields.registrationDeadline = registrationDeadline;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Perform the update
    event = await JobFairEvent.findByIdAndUpdate(
      req.params.jobFairEventId,
      updateFields,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    res.json({
      success: true,
      message: "Job fair event details updated.",
      data: event,
    });
  } catch (err) {
    console.error(err);

    // Handle validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    // Handle cast error (invalid ID format)
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid event ID",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

export const preRegisterForJobFair = async (req, res) => {
  const accountId = req.accountId;
  const role = req.role;

  try {
    const { eventId } = req.body;

    if (!["jobseeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    // Find associated JobSeeker or Employer
    let jobseeker = null;
    let employer = null;

    if (role === "jobseeker") {
      jobseeker = await JobSeeker.findOne({ accountId });
      if (!jobseeker)
        return res.status(404).json({ message: "JobSeeker not found." });
    }

    if (role === "employer") {
      employer = await Company.findOne({ accountId });
      if (!employer)
        return res.status(404).json({ message: "Employer not found." });
    }

    // Generate reference number
    const randomSegment = crypto.randomBytes(4).toString("hex").toUpperCase();
    const referenceNumber = `JF-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${randomSegment}`;

    // Generate QR Code with additional information
    const qrCodeData = JSON.stringify({
      referenceNumber: referenceNumber,
      eventId: eventId,
      role: role,
      accountId: accountId,
      [role === "jobseeker" ? "jobSeekerId" : "employerId"]:
        role === "jobseeker" ? jobseeker._id : employer._id,
    });

    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Create preregistration entry
    const prereg = new JobFairPreregistration({
      accountId: accountId,
      eventId: eventId,
      role,
      referenceNumber,
      qrCode: qrCodeImage,
      jobSeekerId: jobseeker?._id,
      employerId: employer?._id,
    });

    await prereg.save();

    res.status(201).json({
      message: "Successfully preregistered.",
      preRegistration: prereg,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Already preregistered for this event." });
    }
    console.error("Preregistration error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getPreRegistration = async (req, res) => {
  const accountId = req.accountId;

  try {
    const activeJobFair = await JobFairEvent.findOne({ isActive: true });
    if (!activeJobFair) {
      return res.status(404).json({ message: "No active job fair found." });
    }
    const preRegistration = await JobFairPreregistration.findOne({
      accountId,
      eventId: activeJobFair._id,
    });
    if (!preRegistration) {
      return res.status(404).json({ message: "No preregistration found." });
    }
    res.status(200).json({ success: true, preRegistration });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const {
      referenceNumber,
      eventId,
      role,
      accountId,
      jobSeekerId,
      employerId,
    } = req.body;

    // Step 2: Find matching preregistration
    const prereg = await JobFairPreregistration.findOne({
      referenceNumber,
      eventId,
      accountId,
    });

    if (!prereg) {
      return res.status(404).json({ message: "Preregistration not found." });
    }

    // Step 3: Check for existing attendance
    const alreadyAttended = await JobFairAttendance.findOne({
      preRegistrationId: prereg._id,
    });

    if (alreadyAttended) {
      return res.status(409).json({ message: "Already checked in." });
    }

    // Step 4: Create attendance record
    const attendance = new JobFairAttendance({
      eventId,
      preRegistrationId: prereg._id,
      accountId,
      role,
      jobSeekerId: jobSeekerId || null,
      employerId: employerId || null,
      referenceNumber,
    });

    await attendance.save();

    res.status(201).json({
      message: "✅ Attendance recorded successfully.",
      attendance,
    });
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllPreRegistered = async (req, res) => {
  try {
    const activeJobFair = await JobFairEvent.findOne({ isActive: true });
    if (!activeJobFair) {
      return res.status(404).json({ message: "No active job fair found." });
    }
    const preregs = await JobFairPreregistration.find({
      eventId: activeJobFair._id,
    });
    res.status(200).json({ preregs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getAllPreRegisteredByEventId = async (req, res) => {
  const { eventId } = req.params;
  try {
    const preregs = await JobFairPreregistration.find({
      eventId,
    });
    res.status(200).json({ preregs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getAllAttendance = async (req, res) => {
  const { eventId } = req.params;
  try {
    const attendance = await JobFairAttendance.find({
      eventId,
    });
    res.status(200).json({ attendance });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const toggleJobFairActivation = async (req, res) => {
  const { eventId } = req.params;

  try {
    const current = await JobFairEvent.findById(eventId);
    if (!current) {
      return res
        .status(404)
        .json({ success: false, message: "Job fair not found." });
    }

    if (!current.isActive) {
      // Deactivate any other active job fairs
      await JobFairEvent.updateMany({ isActive: true }, { isActive: false });
    }

    current.isActive = !current.isActive;
    await current.save();

    return res.status(200).json({
      success: true,
      message: `Job fair has been ${
        current.isActive ? "activated" : "deactivated"
      }.`,
      data: current,
    });
  } catch (error) {
    console.error("Error toggling job fair:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
