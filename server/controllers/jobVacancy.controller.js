import JobVacancy from "../models/jobVacancy.model.js";
import JobSeeker from "../models/jobseeker.model.js";
import Company from "../models/company.model.js";
import { auditTrail } from "../utils/auditTrail.js";
import JobInvitation from "../models/jobInvitation.model.js";
import { sendEmail } from "../utils/email.js";

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
      applicationDeadline: formattedDeadline, // Use formatted deadline
      responsibilities,
      skillsRequired,
      interviewProcess,
      industry, // Include industry field
    });

    // Add the new job to the company's jobVacancies array
    company.jobVacancies.push(newJob._id);
    await company.save();

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
            index: "jobTitleSearch",
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

// get recommended jobs
// export const getRecommendedJobVacancies = async (req, res) => {
//   const {
//     jobPositions,
//     locations,
//     salaryMin,
//     salaryMax,
//     employmentType,
//     salaryType,
//   } = req.body;

//   try {
//     const pipeline = [
//       {
//         $search: {
//           index: "job_vacancy_index",
//           compound: {
//             must: [
//               {
//                 text: {
//                   query: jobPositions,
//                   path: "jobTitle",
//                   fuzzy: { maxEdits: 2 }, // Allows up to 2 typos
//                 },
//               },
//             ],
//             should: [
//               {
//                 text: {
//                   query: locations,
//                   path: "workLocation",
//                   fuzzy: { maxEdits: 2 }, // Allows up to 2 typos
//                 },
//               },
//             ],
//           },
//         },
//       },
//       {
//         $match: {
//           salaryMin: { $lte: salaryMax }, // Ensure job's salaryMin is within salaryMax range
//           salaryMax: { $gte: salaryMin }, // Ensure job's salaryMax is within salaryMin range
//           ...(employmentType ? { employmentType } : {}), // Filter by employment type if provided
//           ...(salaryType ? { salaryType } : {}), // Filter by salary type if provided
//         },
//       },
//       {
//         $addFields: {
//           salaryMinDifference: {
//             $abs: { $subtract: ["$salaryMin", salaryMin] },
//           },
//           salaryMaxDifference: {
//             $abs: { $subtract: ["$salaryMax", salaryMax] },
//           },
//           positionMatch: {
//             $cond: {
//               if: {
//                 $eq: ["$jobTitle", jobPositions], // Exact match for job title
//               },
//               then: 1, // High priority if job title matches exactly
//               else: 0, // Low priority if job title doesn't match exactly
//             },
//           },
//         },
//       },
//       {
//         $sort: {
//           positionMatch: -1, // Prioritize jobs where position matches exactly
//           salaryMinDifference: 1, // Then sort by salaryMin closeness
//           salaryMaxDifference: 1, // Then by salaryMax closeness
//         },
//       },
//       {
//         $limit: 10, // Limit the results for performance
//       },
//       {
//         $lookup: {
//           from: "companies", // Replace with the correct company collection name
//           localField: "companyId", // The field in JobVacancy referencing company
//           foreignField: "_id", // The field in Company collection being referenced
//           as: "companyDetails", // Alias for the joined company data
//         },
//       },
//       {
//         $unwind: {
//           path: "$companyDetails", // Unwind the company details array to access its fields
//           preserveNullAndEmptyArrays: true, // Keep documents even without matching company
//         },
//       },
//       {
//         $project: {
//           jobTitle: 1,
//           workLocation: 1,
//           salaryMin: 1,
//           salaryMax: 1,
//           employmentType: 1,
//           salaryType: 1,
//           description: 1,
//           companyId: 1,
//           companyName: "$companyDetails.companyInformation.businessName", // Replace with the field you want from the company
//         },
//       },
//     ];

//     const results = await JobVacancy.aggregate(pipeline);

//     if (results.length === 0) {
//       return res.status(404).json({ message: "No matching jobs found." });
//     }

//     res.status(200).json({ results });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to fetch job recommendations." });
//   }
// };

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
  try {
    const { jobVacancyId } = req.params;
    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { publicationStatus: "approved" },
      { new: true }
    ).populate({
      path: "accountId",
      select: "emailAddress",
    });

    if (!jobVacancy) {
      return res.status(404).json({ message: "Job vacancy not found" });
    }

    const emailContent = {
      to: jobVacancy?.accountId?.emailAddress, // Send to the email associated with the company
      subject: `Job Vacancy Approved: ${jobVacancy?.jobTitle}`,
      text: `Dear ${jobVacancy?.companyName || "Company"},
      
    We are pleased to inform you that your job vacancy titled "${jobVacancy?.jobTitle}" has been approved and is now published on our platform.
    
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
        
          <p style="font-size: 16px;">Dear ${jobVacancy?.companyId?.companyInformation?.businessName || "Company"},</p>
        
          <p style="font-size: 16px;">We are pleased to inform you that your job vacancy titled "<strong>${jobVacancy?.jobTitle}</strong>" has been approved and is now published on our platform.</p>
        
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

    res.status(200).json({ message: "Job vacancy approved", jobVacancy });
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

    const jobVacancy = await JobVacancy.findByIdAndUpdate(
      jobVacancyId,
      { publicationStatus: "declined", remarks: reason },
      { new: true }
    ).populate({
      path: "accountId",
      select: "emailAddress",
    })

    if (!jobVacancy) {
      return res.status(404).json({ message: "Job vacancy not found" });
    }

    // Save activity
    auditTrail({ accountId, action: "decline a job vacancy" });

    const emailContent = {
      to: jobVacancy?.accountId?.emailAddress, // Recipient's email
      subject: `Job Vacancy Declined: ${jobVacancy?.jobTitle}`,
      text: `Dear ${jobVacancy?.companyInformation?.businessName || "Company"},
      
    We regret to inform you that your job vacancy titled "${jobVacancy?.jobTitle}" has been declined. Below is the reason provided:
    
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
          
          <p style="font-size: 16px;">Dear ${jobVacancy?.companyInformation?.businessName || "Company"},</p>
          
          <p style="font-size: 16px;">We regret to inform you that your job vacancy titled "<strong>${jobVacancy?.jobTitle}</strong>" has been declined for the following reason:</p>
          
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-left: 5px solid #f44336; border-radius: 5px; margin: 15px 0;">
            <strong>Reason:</strong> ${jobVacancy?.remarks || "No specific reason provided."}
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
      text: `Dear ${jobVacancy.companyName || "Company"},\n\nWe regret to inform you...`, // Use the dynamic text
      html: emailContent.html, // Use the HTML content
    });

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

    // Check if the job vacancy exists and belongs to the company, with full population of fields
    const jobVacancy = await JobVacancy.findOne({
      _id: jobVacancyId,
      companyId: companyId,
    }).populate({
      path: "companyId", // Populate the companyId with full company data
      select: "companyInformation", // Include company information in the population
    });

    if (!jobVacancy) {
      return res.status(404).json({
        message: "Job vacancy not found or not owned by the company.",
      });
    }

    // Check if the job seeker exists, with full population of fields
    const jobSeeker = await JobSeeker.findById(jobSeekerId)
      .populate({
        path: "accountId",
        select: "emailAddress personalInformation", // Ensure accountId and personalInformation are populated
      })
      .populate("personalInformation");

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found." });
    }

    // Use findOneAndUpdate with upsert
    const invitation = await JobInvitation.findOneAndUpdate(
      {
        jobSeekerId,
        jobVacancyId,
      },
      {
        $setOnInsert: {
          jobSeekerId,
          jobVacancyId,
          companyId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (!invitation._id) {
      return res.status(400).json({
        message: `Job seeker is already invited to the job title: ${jobVacancy.jobTitle}.`,
      });
    }

    // Ensure necessary fields are populated before using them
    const email = jobSeeker?.accountId?.emailAddress;
    const companyName =
      jobVacancy?.companyId?.companyInformation?.businessName || "Company Name";
    const jobTitle = jobVacancy?.jobTitle || "Job Title";

    const emailContent = {
      to: email, // Email of the job seeker
      subject: `Job Invitation for ${jobTitle} at ${companyName}`,
      text: `Dear ${jobSeeker?.personalInformation?.firstName},
    
    You have been invited to apply for the job position: ${jobTitle} at ${companyName}.
    
    Company Name: ${companyName}
    
    For more details, visit our portal.
    
    Best regards,
    PESO City Government of Taguig`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #007BFF; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">PESO City Government of Taguig</h1>
          </div>
          <h2 style="color: #2C3E50; text-align: center;">You're Invited to Apply!</h2>
          <p>Dear ${jobSeeker?.personalInformation?.firstName},</p>
          <p>We are pleased to invite you to apply for the following job position:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company Name:</strong> ${companyName}</li>
          </ul>
          <p>If you are interested, please click the button below for more details or to submit your application:</p>
          <p style="text-align: center;">
            <a href="https://yourjobportal.com" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Job Details</a>
          </p>
          <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #aaa;">
            © 2025 | City Government of Taguig 
          </p>
        </div>
      `,
    };

    await sendEmail(emailContent);

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