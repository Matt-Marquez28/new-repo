import JobSeeker from "../models/jobSeeker.model.js";
import JobSeekerDocuments from "../models/jobSeekerDocuments.js";
import mongoose from "mongoose";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import exceljs from "exceljs";

// get all jobseeker data
export const getJobSeekerData = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const startDateFilter = req.query.startDate
      ? new Date(req.query.startDate)
      : null;

    const jobSeekerData = await JobSeeker.findById(jobSeekerId);

    if (startDateFilter) {
      // Filter the workExperience based on the startDate
      jobSeekerData.workExperience = jobSeekerData.workExperience.filter(
        (experience) => new Date(experience.startDate) <= startDateFilter
      );

      // Filter the educationalBackground based on the startDate (if needed)
      jobSeekerData.educationalBackground =
        jobSeekerData.educationalBackground.filter(
          (education) => new Date(education.startDate) <= startDateFilter
        );
    }

    // Sort the filtered workExperience by startDate (most recent first)
    jobSeekerData.workExperience.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    // Sort the filtered educationalBackground by startDate (most recent first)
    jobSeekerData.educationalBackground.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    res.status(200).json({ success: true, jobSeekerData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all jobseekers
export const getAllJobSeekers = async (req, res) => {
  try {
    const jobSeekers = await JobSeeker.find();
    res.status(200).json({ success: true, jobSeekers });
  } catch (error) {
    console.log();
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// update personal information
export const updatePersonalInformation = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId; // Extract the JobSeeker ID from the request
    const personalInformation = req.body; // Extract personal information from the request body

    // Validate presence of personalInformation
    if (!personalInformation || typeof personalInformation !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Personal information is required." });
    }

    // Fetch existing JobSeeker to preserve the photo field
    const existingJobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!existingJobSeeker) {
      return res
        .status(404)
        .json({ success: false, message: "Job Seeker not found." });
    }

    // Check if a new file is uploaded and handle Cloudinary upload if present
    if (req.file) {
      const file = req.file;
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      personalInformation["photo"] = cloudResponse.secure_url;
    } else {
      // Keep the existing photo if no new file is uploaded
      personalInformation["photo"] =
        existingJobSeeker.personalInformation.photo;
    }

    // Update JobSeeker with the new information
    const updatedPersonalInformation = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { personalInformation },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Personal information updated successfully.",
      personalInformation: updatedPersonalInformation.personalInformation,
    });
  } catch (error) {
    console.error("Error updating personal information:", error.message);

    // Handle invalid ObjectId errors
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Job Seeker ID format." });
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// update job preferences
export const updateJobPreferences = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;

    const {
      jobPositions,
      locations,
      salaryType,
      salaryMin,
      salaryMax,
      employmentType,
      industries,
    } = req.body;

    if (
      !Array.isArray(jobPositions) ||
      !jobPositions.length ||
      !Array.isArray(locations) ||
      !locations.length ||
      salaryType === "" ||
      salaryMin === "" ||
      salaryMax === "" ||
      !employmentType ||
      !Array.isArray(industries) ||
      !industries.length
    ) {
      return res.status(400).json({
        message: "All job preferences fields are required.",
      });
    }

    // Find the JobSeeker by job seeker id
    const jobSeeker = await JobSeeker.findById(jobSeekerId);

    // Check if the job seeker exists
    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found." });
    }

    // Update the jobPreferences field of the found JobSeeker
    jobSeeker.jobPreferences = {
      jobPositions,
      locations,
      salaryType,
      salaryMax,
      salaryMin,
      employmentType,
      industries,
    };

    // Save the updated jobSeeker document
    const updatedJobSeeker = await jobSeeker.save();

    return res.status(200).json({
      message: "Job preferences updated successfully.",
      jobPreferences: updatedJobSeeker.jobPreferences,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

export const addWorkExperience = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const body = req.body || {};
    const uploadedFiles = [];

    // Make file uploads optional
    if (req.files && Object.keys(req.files).length > 0) {
      try {
        for (const field in req.files) {
          for (const file of req.files[field]) {
            const filePath = file.path;
            const fileBuffer = await fs.promises.readFile(filePath);

            const result = await new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  { resource_type: "auto" },
                  (error, uploadResult) => {
                    if (error) reject(error);
                    else resolve(uploadResult);
                  }
                )
                .end(fileBuffer);
            });

            uploadedFiles.push({
              url: result.url,
              originalName: file.originalname,
            });
          }
        }
      } catch (fileError) {
        console.error(
          "File upload error (continuing without files):",
          fileError
        );
      }
    }

    // Find the job seeker
    const jobSeeker = await JobSeeker.findOne({
      accountId: req.accountId,
    });
    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found" });
    }

    // Helper function to safely parse array fields
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string")
        return field.split(",").map((item) => item.trim());
      return [];
    };

    // Create new work experience with all fields optional
    const newWorkExperience = {
      jobTitle: body.jobTitle || null,
      companyName: body.companyName || null,
      location: body.location || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      currentlyWorking: Boolean(body.currentlyWorking),
      keyResponsibilities: parseArrayField(body.keyResponsibilities),
      achievements_and_contributions: parseArrayField(
        body.achievements_and_contributions
      ),
      skills_and_tools_used: parseArrayField(body.skills_and_tools_used),
      proofOfWorkExperienceDocuments: uploadedFiles,
    };

    // Initialize workExperience array if it doesn't exist
    if (!jobSeeker.workExperience) {
      jobSeeker.workExperience = [];
    }

    jobSeeker.workExperience.push(newWorkExperience);
    await jobSeeker.save();

    res.status(201).json({
      message: "Work experience added successfully!",
      data: newWorkExperience,
    });
  } catch (error) {
    console.error("Error adding work experience:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({
      message: "Error adding work experience",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const addEducationalBackground = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const uploadedFiles = [];
    const body = req.body || {}; // Ensure body exists even if empty

    // Handle file uploads if they exist (now completely optional)
    if (req.files && Object.keys(req.files).length > 0) {
      try {
        for (const field in req.files) {
          for (const file of req.files[field]) {
            const filePath = file.path;
            const fileBuffer = await fs.promises.readFile(filePath);

            const result = await new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload_stream(
                  { resource_type: "auto" },
                  (error, uploadResult) => {
                    if (error) reject(error);
                    else resolve(uploadResult);
                  }
                )
                .end(fileBuffer);
            });

            uploadedFiles.push({
              url: result.url,
              originalName: file.originalname,
            });
          }
        }
      } catch (fileError) {
        console.error(
          "File upload error (non-critical, continuing):",
          fileError
        );
      }
    }

    // Find the job seeker
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).send("Job seeker not found.");
    }

    // Helper function to safely parse array fields
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string")
        return field.split(",").map((item) => item.trim());
      return [];
    };

    // Create new educational background with all fields optional
    const newEducationalBackground = {
      degree_or_qualifications: body.degree_or_qualifications || null,
      fieldOfStudy: body.fieldOfStudy || null,
      institutionName: body.institutionName || null,
      location: body.location || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      currentlyStudying: Boolean(body.currentlyStudying), // Convert to boolean
      achievements: parseArrayField(body.achievements),
      relevantCoursework: parseArrayField(body.relevantCoursework),
      certifications: parseArrayField(body.certifications),
      proofOfEducationDocuments: uploadedFiles,
    };

    // Initialize educationalBackground array if it doesn't exist
    if (!jobSeeker.educationalBackground) {
      jobSeeker.educationalBackground = [];
    }

    jobSeeker.educationalBackground.push(newEducationalBackground);
    await jobSeeker.save();

    res.status(200).json({
      message: "Educational background saved successfully",
      updatedJobSeeker: jobSeeker,
    });
  } catch (err) {
    console.error("Full error details:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({
      message: "Error saving educational background",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// update skills and specializations
export const updateSkillsAndSpecializations = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId; // Replace with actual logic to retrieve the logged-in user's ID
    const { specializations, coreSkills, softSkills } = req.body;

    // Input validation (ensure these fields are arrays)
    if (
      !Array.isArray(specializations) ||
      !Array.isArray(coreSkills) ||
      !Array.isArray(softSkills)
    ) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Update and return the updated document
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      {
        $set: {
          "skillsAndSpecializations.specializations": specializations,
          "skillsAndSpecializations.coreSkills": coreSkills,
          "skillsAndSpecializations.softSkills": softSkills,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedJobSeeker) {
      return res.status(404).json({ message: "Jobseeker not found" });
    }

    return res.status(200).json({
      message: "Skills and specialization updated successfully",
      skillsAndSpecializations: updatedJobSeeker.skillsAndSpecializations,
    });
  } catch (error) {
    console.error("Error updating skills and specializations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// upload required documents
export const uploadRequiredDocuments = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const files = req.files;

    // check if theres is existing documents
    const existingDocuments = await JobSeekerDocuments.findOne({ jobSeekerId });
    if (existingDocuments) {
      return res.status(400).json({
        success: false,
        message: "you have already uploaded the documents!",
      });
    }

    const validID1 = files?.validID1?.[0];
    const validID2 = files?.validID2?.[0];

    if (!validID1 || !validID2) {
      return res.status(400).json({ error: "Both valid IDs are required." });
    }

    // Function to upload a file to Cloudinary
    const uploadFile = async (file) => {
      return await cloudinary.uploader.upload(file.path);
    };

    // Upload both files in parallel
    const [uploadResult1, uploadResult2] = await Promise.all([
      uploadFile(validID1),
      uploadFile(validID2),
    ]);

    // Save document details in MongoDB
    const jobSeekerDocuments = new JobSeekerDocuments({
      jobSeekerId,
      validId1: uploadResult1.secure_url,
      validId1OriginalName: validID1.originalname,
      validId2: uploadResult2.secure_url,
      validId2OriginalName: validID2.originalname,
    });

    const savedDocuments = await jobSeekerDocuments.save();

    return res.status(201).json({
      success: true,
      message: "Documents uploaded and saved successfully",
      savedDocuments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload and save documents" });
  }
};

// get job seeker documents
export const getJobSeekerDocuments = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeekerDocuments = await JobSeekerDocuments.findOne({
      jobSeekerId,
    });
    if (!jobSeekerDocuments) {
      return res
        .status(400)
        .json({ success: false, message: "Documents not found!" });
    }
    res.status(200).json({ success: true, jobSeekerDocuments });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error!" });
  }
};

// update educational backgrounds
export const updateEducationalBackgrounds = async (req, res) => {
  const { educationalBackgrounds } = req.body;
  const jobSeekerId = req.jobSeekerId;

  try {
    // Update the educational backgrounds directly
    const updatedUser = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { $set: { educationalBackground: educationalBackgrounds } },
      { new: true }
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(200).json({
      message: "Educational backgrounds updated successfully",
      educationalBackgrounds: updatedUser.educationalBackground, // Directly access educationalBackground
    });
  } catch (error) {
    console.error("Error updating educational backgrounds:", error);
    res.status(500).json({
      message: "Error updating educational backgrounds",
      error: error.message,
    });
  }
};

// update work experiences
export const updateWorkExperiences = async (req, res) => {
  const { workExperiences } = req.body;

  try {
    const jobSeekerId = req.jobSeekerId;

    // Update the work experiences in the database
    const updatedUser = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { $set: { workExperience: workExperiences } },
      { new: true }
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(200).json({
      message: "Work experiences updated successfully",
      workExperiences: updatedUser.workExperience,
    });
  } catch (error) {
    console.error("Error updating work experiences:", error);
    res.status(500).json({
      message: "Error updating work experiences",
      error: error.message,
    });
  }
};

// Get all job seeker documents
export const getAllJobSeekerDocuments = async (req, res) => {
  try {
    const { status } = req.query; // Get the status from the query parameters

    // Build the filter query for documents
    const filter = status && status !== "all" ? { status } : {};

    // Fetch documents based on the filter and get statistics for all documents
    const [documents, stats] = await Promise.all([
      JobSeekerDocuments.find(filter)
        .populate(
          "jobSeekerId",
          "personalInformation.firstName personalInformation.lastName personalInformation.emailAddress"
        )
        .sort({ createdAt: -1 }),
      JobSeekerDocuments.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format stats into an object for easier consumption
    const statsFormatted = stats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      { pending: 0, verified: 0, declined: 0, all: 0 }
    );

    // Add a total count of all documents in the collection
    statsFormatted.all = stats.reduce((total, { count }) => total + count, 0);

    res.status(200).json({
      success: true,
      documents,
      stats: statsFormatted,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get single jobseeker document
export const getJobSeekerDocument = async (req, res) => {
  const { documentId } = req.params;
  try {
    const document = await JobSeekerDocuments.findById(documentId);
    if (!document) {
      return res
        .status(400)
        .json({ success: false, message: "Document not found!" });
    }
    res.status(200).json({ success: true, document });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// search job seekers
export const searchJobSeekers = async (req, res) => {
  try {
    const { specialization } = req.query;

    // Check if specialization is provided and is not an empty string
    if (!specialization || specialization.trim() === "") {
      return res.status(400).json({ message: "Specialization is required" });
    }

    // Define the aggregation pipeline
    const pipeline = [
      {
        $search: {
          index: "jobSeekerSearch", // Use your custom index name here
          text: {
            query: specialization,
            path: "skillsAndSpecializations.specializations",
            fuzzy: { maxEdits: 2 }, // Allows up to 2 typos
          },
        },
      },
      {
        $project: {
          "personalInformation.photo": 1,
          "personalInformation.firstName": 1,
          "personalInformation.middleName": 1,
          "personalInformation.lastName": 1,
          "personalInformation.street": 1,
          "personalInformation.barangay": 1,
          "personalInformation.cityMunicipality": 1,
          "personalInformation.province": 1,
          "personalInformation.zipCode": 1,
          "personalInformation.aboutMe": 1,
          "personalInformation.emailAddress": 1,
          "personalInformation.mobileNumber": 1,
          "personalInformation.cityMunicipality": 1,
          "skillsAndSpecializations.specializations": 1,
          "skillsAndSpecializations.coreSkills": 1,
          "skillsAndSpecializations.softSkills": 1,
        },
      },
      {
        $limit: 10, // Limit the results for performance
      },
    ];

    // Execute the aggregation query
    const jobSeekers = await JobSeeker.aggregate(pipeline);

    if (jobSeekers.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching job seekers found." });
    }

    res.status(200).json({ jobSeekers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while searching for job seekers" });
  }
};

// get job seeker data by id
export const getJobSeekerDataById = async (req, res) => {
  try {
    const { jobSeekerId } = req.params;
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res
        .status(404)
        .json({ success: false, message: "Job seeker not found!" });
    }
    res.status(200).json({ success: true, jobSeeker });
  } catch (error) {
    console.log(error);
  }
};

// get recommended candidates
export const recommendCandidates = async (req, res) => {
  const { educationalLevels, skills, specializations } = req.body;

  try {
    // Sanitize inputs to ensure they are arrays and provide defaults
    const sanitizedEducationalLevels =
      educationalLevels && educationalLevels.length > 0
        ? educationalLevels
        : [];
    const sanitizedSkills = skills && skills.length > 0 ? skills : [];
    const sanitizedSpecializations =
      specializations && specializations.length > 0 ? specializations : [];

    if (sanitizedSpecializations.length === 0) {
      return res
        .status(400)
        .json({ message: "Specializations are required for recommendations." });
    }

    const pipeline = [
      {
        $search: {
          index: "jobSeekerSearch",
          compound: {
            must: [
              {
                text: {
                  query: sanitizedSpecializations,
                  path: "skillsAndSpecializations.specializations",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2,
                  },
                  score: { boost: { value: 3 } },
                },
              },
            ],
            should: [
              ...(sanitizedSkills.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedSkills,
                        path: "skillsAndSpecializations.coreSkills",
                        fuzzy: {
                          maxEdits: 1,
                          prefixLength: 2,
                        },
                        score: { boost: { value: 2 } },
                      },
                    },
                  ]
                : []),
              ...(sanitizedEducationalLevels.length > 0
                ? [
                    {
                      text: {
                        query: sanitizedEducationalLevels,
                        path: "personalInformation.educationalLevel",
                        score: { boost: { value: 1 } },
                      },
                    },
                  ]
                : []),
            ],
            minimumShouldMatch: 0,
          },
        },
      },
      // Ensure that the fields are treated as arrays and count the intersections
      {
        $addFields: {
          searchScore: { $meta: "searchScore" },
          specializationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        {
                          $isArray: "$skillsAndSpecializations.specializations",
                        },
                        "$skillsAndSpecializations.specializations",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedSpecializations,
              ],
            },
          },
          skillMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        { $isArray: "$skillsAndSpecializations.coreSkills" },
                        "$skillsAndSpecializations.coreSkills",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedSkills,
              ],
            },
          },
          educationMatchCount: {
            $size: {
              $setIntersection: [
                {
                  $ifNull: [
                    {
                      $cond: [
                        { $isArray: "$personalInformation.educationalLevel" },
                        "$personalInformation.educationalLevel",
                        [],
                      ],
                    },
                    [],
                  ],
                },
                sanitizedEducationalLevels,
              ],
            },
          },
        },
      },
      // Adjust the score based on the number of matches
      {
        $addFields: {
          adjustedScore: {
            $add: [
              "$searchScore",
              { $multiply: ["$specializationMatchCount", 2] }, // Each match in specializations adds 2 to the score
              { $multiply: ["$skillMatchCount", 1.5] }, // Each match in skills adds 1.5 to the score
              { $multiply: ["$educationMatchCount", 1] }, // Each match in education adds 1 to the score
            ],
          },
        },
      },
      // Sort by the adjustedScore in descending order
      {
        $sort: { adjustedScore: -1 },
      },
      // Limit to a certain number of candidates, e.g., top 10
      {
        $limit: 10,
      },
    ];

    // Execute the aggregation pipeline
    const recommendedCandidates = await JobSeeker.aggregate(pipeline);

    if (recommendedCandidates.length === 0) {
      return res.status(404).json({ message: "No matching candidates found." });
    }

    // Return the candidates along with their adjusted scores
    res.status(200).json({ candidates: recommendedCandidates });
  } catch (error) {
    console.error("Error recommending candidates:", error);
    res.status(500).json({ message: "Failed to recommend candidates." });
  }
};

// update employment status
export const updateEmploymentStatus = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const { payload } = req.body;

    if (
      !payload ||
      typeof payload !== "object" ||
      Object.keys(payload).length === 0
    ) {
      return res.status(400).json({ message: "Invalid or empty payload" });
    }

    const jobSeeker = await JobSeeker.findById(jobSeekerId);

    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found" });
    }

    jobSeeker.employmentStatus = payload;
    await jobSeeker.save();

    res.json({
      message: "Employment status updated successfully",
      jobSeeker,
    });
  } catch (error) {
    console.error("Error updating employment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDisability = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const { payload } = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const jobSeeker = await JobSeeker.findById(jobSeekerId);

    if (!jobSeeker) {
      return res.status(404).json({ message: "JobSeeker not found" });
    }

    jobSeeker.disability = payload;
    await jobSeeker.save(); // triggers full schema validation with access to this.parent()

    res.json({
      message: "Disability information updated successfully!",
      jobSeeker,
    });
  } catch (error) {
    console.error("Error updating employment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLanguages = async (req, res) => {
  try {
    const jobSeekerId = req.jobSeekerId;
    const { languages } = req.body;

    // Validate input
    if (!Array.isArray(languages)) {
      return res.status(400).json({ message: "Languages must be an array" });
    }

    // Validate each language object
    const isValid = languages.every((lang) => {
      return (
        lang.name &&
        typeof lang.read === "boolean" &&
        typeof lang.write === "boolean" &&
        typeof lang.speak === "boolean" &&
        typeof lang.understand === "boolean"
      );
    });

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid language data structure" });
    }

    // Update job seeker's languages
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { $set: { languages } },
      { new: true, runValidators: true }
    );

    if (!updatedJobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(200).json({
      message: "Languages updated successfully",
      data: updatedJobSeeker.languages,
    });
  } catch (error) {
    console.error("Error updating languages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateEligibility = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;

  try {
    const { civilService, dateTaken } = req.body;
    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      {
        $push: {
          "eligibilities_and_licences.eligibilities": {
            civilService,
            dateTaken,
          },
        },
      },
      { new: true, runValidators: true }
    ).select("eligibilities_and_licences");

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(201).json({
      message: "Eligibility added successfully",
      eligibilities: jobSeeker.eligibilities_and_licences.eligibilities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add eligibility",
      error: error.message,
    });
  }
};

export const updateProfessionalLicense = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;

  try {
    const { prc, validUntil } = req.body;
    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      {
        $push: {
          "eligibilities_and_licences.professionalLicenses": {
            prc,
            validUntil,
          },
        },
      },
      { new: true, runValidators: true }
    ).select("eligibilities_and_licences");

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(201).json({
      message: "Professional license added successfully",
      licenses: jobSeeker.eligibilities_and_licences.professionalLicenses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add professional license",
      error: error.message,
    });
  }
};

export const deleteEligibility = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      {
        $pull: {
          "eligibilities_and_licences.eligibilities": {
            _id: req.params.eligibilityId,
          },
        },
      },
      { new: true }
    ).select("eligibilities_and_licences");

    if (!jobSeeker) {
      return res.status(404).json({ message: "Eligibility not found" });
    }

    res.status(200).json({
      message: "Eligibility deleted successfully",
      remainingEligibilities:
        jobSeeker.eligibilities_and_licences.eligibilities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete eligibility",
      error: error.message,
    });
  }
};

export const deleteProfessionalLicense = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      {
        $pull: {
          "eligibilities_and_licences.professionalLicenses": {
            _id: req.params.licenseId,
          },
        },
      },
      { new: true }
    ).select("eligibilities_and_licences");

    if (!jobSeeker) {
      return res.status(404).json({ message: "License not found" });
    }

    res.status(200).json({
      message: "Professional license deleted successfully",
      remainingLicenses:
        jobSeeker.eligibilities_and_licences.professionalLicenses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete professional license",
      error: error.message,
    });
  }
};

export const getAllEligibilitiesAndLicenses = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeeker = await JobSeeker.findById(jobSeekerId).select(
      "eligibilities_and_licences"
    );

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    res.status(200).json(jobSeeker.eligibilities_and_licences);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch eligibilities and licenses",
      error: error.message,
    });
  }
};

export const addTraining = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const {
      trainingName,
      hours,
      institution,
      skills,
      certificate, // Now a simple string
      startDate,
      endDate,
    } = req.body;

    const training = {
      trainingName,
      hours: Number(hours),
      institution,
      skills:
        typeof skills === "string"
          ? skills.split(",").map((s) => s.trim())
          : skills || [], // Ensure skills is always an array
      certificate: certificate || undefined, // Simple string field
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    const jobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { $push: { trainings: training } },
      { new: true, runValidators: true }
    );

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker not found",
      });
    }

    res.status(201).json({
      success: true,
      data: jobSeeker.trainings[jobSeeker.trainings.length - 1],
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
};

export const getAllTrainings = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  try {
    const jobSeeker = await JobSeeker.findById(jobSeekerId).select("trainings");

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker not found",
      });
    }

    // Transform the data to match frontend expectations
    const trainings = jobSeeker.trainings.map((training) => ({
      ...training.toObject(),
      // Convert skills array to comma-separated string if needed by frontend
      skills: Array.isArray(training.skills)
        ? training.skills.join(", ")
        : training.skills,
      // Add certificateReceived flag for frontend (not stored in DB)
      certificateReceived: !!training.certificate,
    }));

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const deleteTraining = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const jobSeekerId = req.jobSeekerId;

    // Find and update the job seeker by pulling the training from their array
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      jobSeekerId,
      { $pull: { trainings: { _id: trainingId } } }, // Added missing closing brace and parenthesis
      { new: true }
    );

    if (!updatedJobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Job seeker not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Training deleted successfully",
      data: updatedJobSeeker.trainings,
    });
  } catch (err) {
    console.error("Error deleting training:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const editTraining = async (req, res) => {
  const jobSeekerId = req.jobSeekerId;
  const trainingId = req.params.trainingId;

  try {
    const {
      trainingName,
      hours,
      institution,
      skills,
      certificate,
      startDate,
      endDate,
    } = req.body;

    const updatedTraining = {
      ...(trainingName && { trainingName }),
      ...(hours && { hours: Number(hours) }),
      ...(institution && { institution }),
      ...(skills && {
        skills:
          typeof skills === "string"
            ? skills.split(",").map((s) => s.trim())
            : skills,
      }),
      ...(certificate !== undefined && { certificate }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    const jobSeeker = await JobSeeker.findOneAndUpdate(
      { _id: jobSeekerId, "trainings._id": trainingId },
      {
        $set: Object.fromEntries(
          Object.entries(updatedTraining).map(([key, value]) => [
            `trainings.$.${key}`,
            value,
          ])
        ),
      },
      { new: true, runValidators: true }
    );

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        message: "Training or job seeker not found",
      });
    }

    const updated = jobSeeker.trainings.find(
      (t) => t._id.toString() === trainingId
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
};

export const exportSingleJobSeekerToExcel = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the job seeker with all data
    const jobSeeker = await JobSeeker.findById(id)
      .populate("accountId", "email username")
      .populate("savedJobVacancies", "title company")
      .lean();

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }

    // Create a new workbook
    const workbook = new exceljs.Workbook();
    workbook.creator = "Your System Name";
    workbook.created = new Date();

    // Helper function to style headers
    const styleHeaders = (worksheet) => {
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Freeze header row
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
    };

    // Helper to format dates
    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString() : "";
    };

    // 1. Basic Information Worksheet
    const basicInfoSheet = workbook.addWorksheet("Basic Information");
    basicInfoSheet.columns = [
      { header: "Field", key: "field", width: 30 },
      { header: "Value", key: "value", width: 50 },
    ];

    const personalInfo = jobSeeker.personalInformation || {};
    const basicInfoData = [
      { field: "Account ID", value: jobSeeker.accountId?._id || "" },
      { field: "Account Email", value: jobSeeker.accountId?.email || "" },
      { field: "First Name", value: personalInfo.firstName || "" },
      { field: "Last Name", value: personalInfo.lastName || "" },
      { field: "Middle Name", value: personalInfo.middleName || "" },
      { field: "Suffix", value: personalInfo.suffix || "" },
      { field: "Gender", value: personalInfo.gender || "" },
      { field: "Civil Status", value: personalInfo.civilStatus || "" },
      { field: "Birth Date", value: formatDate(personalInfo.birthDate) },
      {
        field: "Educational Level",
        value: personalInfo.educationalLevel || "",
      },
      { field: "Height", value: personalInfo.height || "" },
      {
        field: "Address",
        value: [
          personalInfo.street,
          personalInfo.barangay,
          personalInfo.cityMunicipality,
          personalInfo.province,
        ]
          .filter(Boolean)
          .join(", "),
      },
      { field: "Email Address", value: personalInfo.emailAddress || "" },
      { field: "Mobile Number", value: personalInfo.mobileNumber || "" },
      { field: "Photo URL", value: personalInfo.photo || "" },
      { field: "About Me", value: personalInfo.aboutMe || "" },
      { field: "Profile Status", value: jobSeeker.status || "" },
    ];

    basicInfoSheet.addRows(basicInfoData);
    styleHeaders(basicInfoSheet);

    // 2. Employment Status Worksheet
    const employmentSheet = workbook.addWorksheet("Employment Status");
    employmentSheet.columns = [
      { header: "Field", key: "field", width: 30 },
      { header: "Value", key: "value", width: 50 },
    ];

    const empStatus = jobSeeker.employmentStatus || {};
    const employmentData = [
      { field: "Current Status", value: empStatus.status || "" },
    ];

    if (empStatus.status === "employed") {
      employmentData.push({
        field: "Employment Type",
        value: empStatus.employedDetails?.employmentType || "",
      });

      if (empStatus.employedDetails?.employmentType === "self-employed") {
        employmentData.push(
          {
            field: "Self-Employment Detail",
            value: empStatus.employedDetails?.selfEmployment?.detail || "",
          },
          {
            field: "Other Detail",
            value: empStatus.employedDetails?.selfEmployment?.otherDetail || "",
          }
        );
      }
    } else if (empStatus.status === "unemployed") {
      employmentData.push(
        { field: "Reason", value: empStatus.unemployedDetails?.reason || "" },
        {
          field: "Other Reason",
          value: empStatus.unemployedDetails?.otherReason || "",
        },
        {
          field: "Months Looking for Work",
          value: empStatus.unemployedDetails?.monthsLookingForWork || "",
        }
      );
    }

    employmentSheet.addRows(employmentData);
    styleHeaders(employmentSheet);

    // 3. Disability Information
    if (jobSeeker.disability?.hasDisability) {
      const disabilitySheet = workbook.addWorksheet("Disability Information");
      disabilitySheet.columns = [
        { header: "Field", key: "field", width: 30 },
        { header: "Value", key: "value", width: 50 },
      ];

      const disabilityData = [
        { field: "Has Disability", value: "Yes" },
        {
          field: "Disability Types",
          value: jobSeeker.disability.types?.join(", ") || "",
        },
        {
          field: "Other Description",
          value: jobSeeker.disability.otherDescription || "",
        },
      ];

      disabilitySheet.addRows(disabilityData);
      styleHeaders(disabilitySheet);
    }

    // 4. Languages
    if (jobSeeker.languages?.length > 0) {
      const languagesSheet = workbook.addWorksheet("Languages");
      languagesSheet.columns = [
        { header: "Language", key: "language", width: 25 },
        { header: "Can Read", key: "read", width: 15 },
        { header: "Can Write", key: "write", width: 15 },
        { header: "Can Speak", key: "speak", width: 15 },
        { header: "Can Understand", key: "understand", width: 15 },
      ];

      jobSeeker.languages.forEach((lang) => {
        languagesSheet.addRow({
          language: lang?.name || lang?.language || "", // Handle both possible property names
          read: lang.read ? "Yes" : "No",
          write: lang.write ? "Yes" : "No",
          speak: lang.speak ? "Yes" : "No",
          understand: lang.understand ? "Yes" : "No",
        });
      });

      styleHeaders(languagesSheet);
    }

    // 5. Skills Worksheet
    const skillsSheet = workbook.addWorksheet("Skills");
    skillsSheet.columns = [
      { header: "Type", key: "type", width: 20 },
      { header: "Skills", key: "skills", width: 60 },
    ];

    const skillsData = [];
    const skills = jobSeeker.skillsAndSpecializations || {};

    if (skills.specializations?.length > 0) {
      skillsData.push({
        type: "Specializations",
        skills: skills.specializations.join(", "),
      });
    }

    if (skills.coreSkills?.length > 0) {
      skillsData.push({
        type: "Core Skills",
        skills: skills.coreSkills.join(", "),
      });
    }

    if (skills.softSkills?.length > 0) {
      skillsData.push({
        type: "Soft Skills",
        skills: skills.softSkills.join(", "),
      });
    }

    if (skillsData.length > 0) {
      skillsSheet.addRows(skillsData);
      styleHeaders(skillsSheet);
    } else {
      workbook.removeWorksheet("Skills");
    }

    // 6. Eligibilities and Licenses
    if (
      jobSeeker.eligibilities_and_licences?.eligibilities?.length > 0 ||
      jobSeeker.eligibilities_and_licences?.professionalLicenses?.length > 0
    ) {
      const eligibilitiesSheet = workbook.addWorksheet(
        "Eligibilities & Licenses"
      );
      eligibilitiesSheet.columns = [
        { header: "Type", key: "type", width: 20 },
        { header: "Name/Number", key: "name", width: 30 },
        { header: "Date Taken/Valid Until", key: "date", width: 20 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      // Add eligibilities
      jobSeeker.eligibilities_and_licences?.eligibilities?.forEach((item) => {
        eligibilitiesSheet.addRow({
          type: "Civil Service Eligibility",
          name: item.civilService,
          date: formatDate(item.dateTaken),
          createdAt: formatDate(item.createdAt),
        });
      });

      // Add professional licenses
      jobSeeker.eligibilities_and_licences?.professionalLicenses?.forEach(
        (item) => {
          eligibilitiesSheet.addRow({
            type: "Professional License",
            name: item.prc,
            date: formatDate(item.validUntil),
            createdAt: formatDate(item.createdAt),
          });
        }
      );

      styleHeaders(eligibilitiesSheet);
    }

    // 7. Work Experience Worksheet
    if (jobSeeker.workExperience?.length > 0) {
      const workExpSheet = workbook.addWorksheet("Work Experience");
      workExpSheet.columns = [
        { header: "Job Title", key: "jobTitle", width: 25 },
        { header: "Company", key: "company", width: 25 },
        { header: "Location", key: "location", width: 25 },
        { header: "Start Date", key: "startDate", width: 15 },
        { header: "End Date", key: "endDate", width: 15 },
        { header: "Currently Working", key: "current", width: 15 },
        { header: "Responsibilities", key: "responsibilities", width: 50 },
        { header: "Achievements", key: "achievements", width: 50 },
        { header: "Skills/Tools Used", key: "skillsTools", width: 50 },
      ];

      jobSeeker.workExperience.forEach((exp) => {
        workExpSheet.addRow({
          jobTitle: exp.jobTitle || "",
          company: exp.companyName || "",
          location: exp.location || "",
          startDate: formatDate(exp.startDate),
          endDate: exp.currentlyWorking ? "Present" : formatDate(exp.endDate),
          current: exp.currentlyWorking ? "Yes" : "No",
          responsibilities: exp.keyResponsibilities?.join("\n") || "",
          achievements: exp.achievements_and_contributions?.join("\n") || "",
          skillsTools: exp.skills_and_tools_used?.join("\n") || "",
        });
      });

      styleHeaders(workExpSheet);
    }

    // 8. Education Worksheet
    if (jobSeeker.educationalBackground?.length > 0) {
      const educationSheet = workbook.addWorksheet("Education");
      educationSheet.columns = [
        { header: "Degree/Qualifications", key: "degree", width: 30 },
        { header: "Field of Study", key: "field", width: 25 },
        { header: "Institution", key: "institution", width: 30 },
        { header: "Location", key: "location", width: 25 },
        { header: "Start Date", key: "startDate", width: 15 },
        { header: "End Date", key: "endDate", width: 15 },
        { header: "Currently Studying", key: "current", width: 15 },
        { header: "Achievements", key: "achievements", width: 40 },
        { header: "Relevant Coursework", key: "coursework", width: 40 },
        { header: "Certifications", key: "certifications", width: 40 },
      ];

      jobSeeker.educationalBackground.forEach((edu) => {
        educationSheet.addRow({
          degree: edu.degree_or_qualifications || "",
          field: edu.fieldOfStudy || "",
          institution: edu.institutionName || "",
          location: edu.location || "",
          startDate: formatDate(edu.startDate),
          endDate: edu.currentlyStudying ? "Present" : formatDate(edu.endDate),
          current: edu.currentlyStudying ? "Yes" : "No",
          achievements: edu.achievements?.join("\n") || "",
          coursework: edu.relevantCoursework?.join("\n") || "",
          certifications: edu.certifications?.join("\n") || "",
        });
      });

      styleHeaders(educationSheet);
    }

    // 9. Trainings
    if (jobSeeker.trainings?.length > 0) {
      const trainingsSheet = workbook.addWorksheet("Trainings");
      trainingsSheet.columns = [
        { header: "Training Name", key: "name", width: 30 },
        { header: "Hours", key: "hours", width: 15 },
        { header: "Institution", key: "institution", width: 30 },
        { header: "Skills", key: "skills", width: 40 },
        { header: "Certificate", key: "certificate", width: 20 },
      ];

      jobSeeker.trainings.forEach((training) => {
        trainingsSheet.addRow({
          name: training.trainingName || "",
          hours: training.hours || "",
          institution: training.institution || "",
          skills: training.skills?.join(", ") || "",
          certificate: training.certificate || "",
        });
      });

      styleHeaders(trainingsSheet);
    }

    // 10. Job Preferences Worksheet
    const prefs = jobSeeker.jobPreferences || {};
    if (
      prefs.jobPositions?.length > 0 ||
      prefs.locations?.length > 0 ||
      prefs.industries?.length > 0
    ) {
      const prefsSheet = workbook.addWorksheet("Job Preferences");
      prefsSheet.columns = [
        { header: "Preference Type", key: "type", width: 25 },
        { header: "Details", key: "details", width: 60 },
      ];

      const prefsData = [];

      if (prefs.jobPositions?.length > 0) {
        prefsData.push({
          type: "Preferred Positions",
          details: prefs.jobPositions.join(", "),
        });
      }

      if (prefs.locations?.length > 0) {
        prefsData.push({
          type: "Preferred Locations",
          details: prefs.locations.join(", "),
        });
      }

      if (prefs.industries?.length > 0) {
        prefsData.push({
          type: "Preferred Industries",
          details: prefs.industries.join(", "),
        });
      }

      prefsData.push(
        { type: "Salary Type", details: prefs.salaryType || "" },
        { type: "Minimum Salary", details: prefs.salaryMin || "" },
        { type: "Maximum Salary", details: prefs.salaryMax || "" },
        { type: "Employment Type", details: prefs.employmentType || "" }
      );

      prefsSheet.addRows(prefsData);
      styleHeaders(prefsSheet);
    }

    // 11. Saved Jobs
    if (jobSeeker.savedJobVacancies?.length > 0) {
      const savedJobsSheet = workbook.addWorksheet("Saved Jobs");
      savedJobsSheet.columns = [
        { header: "Job Title", key: "title", width: 30 },
        { header: "Company", key: "company", width: 30 },
      ];

      jobSeeker.savedJobVacancies.forEach((job) => {
        savedJobsSheet.addRow({
          title: job.title || "",
          company: job.company || "",
        });
      });

      styleHeaders(savedJobsSheet);
    }

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=jobseeker_${jobSeeker._id}_export.xlsx`
    );

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting job seeker data:", error);
    res.status(500).json({
      message: "Error exporting job seeker data",
      error: error.message,
    });
  }
};

export const checkProfileCompleteness = async (req, res) => {
  try {
    // const jobSeekerId = '67f8944e11a0b0b79d5211d4';
    const jobSeekerId = req.jobSeekerId;

    // 1. Find the job seeker
    const jobSeeker = await JobSeeker.findById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // 2. Use our schema method
    const { isComplete, incompleteSections } =
      jobSeeker.checkProfileCompleteness();

    // 3. Return results
    res.json({
      success: true,
      isComplete,
      incompleteSections,
    });
  } catch (error) {
    console.error("Profile completeness check failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
