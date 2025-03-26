import JobSeeker from "../models/jobSeeker.model.js";
import JobSeekerDocuments from "../models/jobSeekerDocuments.js";
import mongoose from "mongoose";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

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

// add work experience
// export const addWorkExperience = async (req, res) => {
//   try {
//     // Check if files were uploaded
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send("No files were uploaded.");
//     }

//     // Retrieve the job seeker (or create new if necessary)
//     const jobSeekerId = req.jobSeekerId;

//     // Cloudinary upload logic
//     const uploadedFiles = [];

//     // Loop through each file field and upload files to Cloudinary
//     for (const field in req.files) {
//       for (const file of req.files[field]) {
//         const filePath = file.path; // Path to the uploaded file on disk

//         // Read the file buffer from disk
//         const fileBuffer = await new Promise((resolve, reject) => {
//           fs.readFile(filePath, (err, data) => {
//             if (err) {
//               reject(new Error("Error reading file"));
//             } else {
//               resolve(data);
//             }
//           });
//         });

//         // Upload the file buffer to Cloudinary
//         const result = await new Promise((resolve, reject) => {
//           cloudinary.uploader
//             .upload_stream(
//               { resource_type: "auto" }, // Automatically detect file type
//               (error, uploadResult) => {
//                 if (error) {
//                   reject(new Error("Error uploading to Cloudinary"));
//                 } else {
//                   resolve(uploadResult);
//                 }
//               }
//             )
//             .end(fileBuffer);
//         });

//         uploadedFiles.push({
//           url: result.url,
//           originalName: file.originalname,
//         }); // Collect the Cloudinary URLs
//       }
//     }

//     // Find the JobSeeker by accountId (or another identifier)
//     const jobSeeker = await JobSeeker.findOne({
//       accountId: req.accountId,
//     });
//     if (!jobSeeker) {
//       return res.status(404).json({ message: "JobSeeker not found" });
//     }

//     // Process fields that should be arrays, like achievements and key responsibilities
//     const achievementsAndContributions = req.body.achievements_and_contributions
//       ? req.body.achievements_and_contributions
//           .split(",")
//           .map((item) => item.trim())
//       : []; // Split string and convert to array, trimming whitespace
//     const keyResponsibilities = req.body.keyResponsibilities
//       ? req.body.keyResponsibilities.split(",").map((item) => item.trim())
//       : []; // Split string and convert to array, trimming whitespace
//     const skillsAndToolsUsed = req.body.skills_and_tools_used
//       ? req.body.skills_and_tools_used.split(",").map((item) => item.trim())
//       : []; // Split string and convert to array, trimming whitespace

//     const newWorkExperience = {
//       jobTitle: req.body.jobTitle,
//       companyName: req.body.companyName,
//       location: req.body.location,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       currentlyWorking: req.body.currentlyWorking,
//       keyResponsibilities: keyResponsibilities, // Now an array
//       achievements_and_contributions: achievementsAndContributions, // Now an array
//       skills_and_tools_used: skillsAndToolsUsed, // Now an array
//       proofOfWorkExperienceDocuments: uploadedFiles, // Assuming uploadedFiles is defined earlier in the code as the Cloudinary URLs
//     };

//     // Push the new work experience into the workExperience array
//     jobSeeker.workExperience.push(newWorkExperience);

//     // Save the updated jobSeeker document
//     await jobSeeker.save();

//     // Return success response
//     res.status(201).json({
//       message: "Work experience added successfully!",
//       data: newWorkExperience,
//     });
//   } catch (error) {
//     console.error("Error adding work experience:", error);
//     res.status(500).json({
//       message: "Error adding work experience. Please try again later.",
//       error: error.message,
//     });
//   }
// };

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

// add educational background
// export const addEducationalBackground = async (req, res) => {
//   try {
//     // Check if files were uploaded
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send("No files were uploaded.");
//     }

//     const jobSeekerId = req.jobSeekerId;
//     const uploadedFiles = [];

//     // Loop through each file field and upload files to Cloudinary
//     for (const field in req.files) {
//       for (const file of req.files[field]) {
//         const filePath = file.path;

//         // Read file buffer
//         const fileBuffer = await new Promise((resolve, reject) => {
//           fs.readFile(filePath, (err, data) => {
//             if (err) {
//               reject(new Error("Error reading file"));
//             } else {
//               resolve(data);
//             }
//           });
//         });

//         // Upload file buffer to Cloudinary
//         const result = await new Promise((resolve, reject) => {
//           cloudinary.uploader
//             .upload_stream({ resource_type: "auto" }, (error, uploadResult) => {
//               if (error) {
//                 reject(new Error("Error uploading to Cloudinary"));
//               } else {
//                 resolve(uploadResult);
//               }
//             })
//             .end(fileBuffer);
//         });

//         // Store Cloudinary URL and original filename
//         uploadedFiles.push({
//           url: result.url,
//           originalName: file.originalname,
//         });
//       }
//     }

//     // Find the job seeker
//     const jobSeeker = await JobSeeker.findById(jobSeekerId);
//     if (!jobSeeker) {
//       return res.status(404).send("Job seeker not found.");
//     }

//     // Ensure that achievements, relevantCoursework, and certifications are arrays
//     const achievements =
//       req.body.achievements && typeof req.body.achievements === "string"
//         ? req.body.achievements.split(",").map((item) => item.trim()) // Split if string and convert to array
//         : req.body.achievements || []; // Default to empty array if undefined or null

//     const relevantCoursework =
//       req.body.relevantCoursework &&
//       typeof req.body.relevantCoursework === "string"
//         ? req.body.relevantCoursework.split(",").map((item) => item.trim()) // Split if string and convert to array
//         : req.body.relevantCoursework || []; // Default to empty array if undefined or null

//     const certifications =
//       req.body.certifications && typeof req.body.certifications === "string"
//         ? req.body.certifications.split(",").map((item) => item.trim()) // Split if string and convert to array
//         : req.body.certifications || []; // Default to empty array if undefined or null

//     // Create a new educational background object
//     const newEducationalBackground = {
//       degree_or_qualifications: req.body.degree_or_qualifications,
//       fieldOfStudy: req.body.fieldOfStudy,
//       institutionName: req.body.institutionName,
//       location: req.body.location,
//       startDate: req.body.startDate,
//       endDate: req.body.endDate,
//       currentlyStudying: req.body.currentlyStudying,
//       achievements, // Store as array
//       relevantCoursework, // Store as array
//       certifications, // Store as array
//       proofOfEducationDocuments: uploadedFiles, // Attach uploaded files with original names
//     };

//     // Push and save the new educational background to the job seeker's profile
//     jobSeeker.educationalBackground.push(newEducationalBackground);
//     await jobSeeker.save();

//     res.status(200).json({
//       message: "Files uploaded and saved successfully",
//       updatedJobSeeker: jobSeeker,
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res
//       .status(500)
//       .json({ message: "Error uploading files", error: err.message });
//   }
// };

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
