import Company from "../models/company.model.js";
import mongoose from "mongoose";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import CompanyDocuments from "../models/companyDocuments.model.js";
import pdf from "pdf-creator-node";
import PDFDocument from "pdfkit";
import puppeteer from "puppeteer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Account } from "../models/account.model.js";
import { sendEmail } from "../utils/email.js";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { createNotification } from "../utils/notification.js";

// dotenv.config();

export const upsertCompany = async (req, res) => {
  try {
    const accountId = req.accountId;
    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, message: "Account ID is missing" });
    }

    const companyData = { ...req.body };

    // Handle file upload if present
    if (req.file) {
      const file = req.file;
      const fileUri = getDataUri(file);
      const uploadResult = await cloudinary.uploader.upload(fileUri.content);
      const photoUrl = uploadResult.secure_url;
      companyData.companyLogo = photoUrl;
    }

    // Fetch existing data if companyLogo is not provided
    const existingCompany = await Company.findOne({ accountId });
    if (
      !req.file &&
      existingCompany &&
      existingCompany.companyInformation.companyLogo
    ) {
      companyData.companyLogo = existingCompany.companyInformation.companyLogo;
    }

    // Upsert company data
    const company = await Company.findOneAndUpdate(
      { accountId },
      { $set: { companyInformation: companyData } },
      { new: true, upsert: true, runValidators: true }
    );

    // Generate new token with companyId
    const tokenData = {
      accountId: accountId,
      companyId: company._id,
      role: "employer",
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });

    // Set HTTP-only cookie and send JSON response in a single response
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      })
      .status(200)
      .json({
        message: company.isNew
          ? "Company created successfully."
          : "Company updated successfully.",
        company,
      });
  } catch (error) {
    console.error("Error in upsertCompany:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const { status, isRenewal } = req.query;

    // Base filter excludes 'incomplete' status
    const baseFilter = { status: { $ne: "incomplete" } };

    // Add renewal filter to the base filter if it's set to true
    let filter = baseFilter;
    if (status && status !== "all") {
      filter = { ...filter, status };
    }

    if (isRenewal === "true") {
      filter = { ...filter, isRenewal: true };
    } else if (isRenewal === "false") {
      filter = { ...filter, isRenewal: false };
    }

    // Fetch companies and enhanced statistics concurrently
    const [companies, statusStats, renewalStats] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }),
      // Regular status statistics
      Company.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      // Renewal statistics
      Company.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: "$isRenewal",
            count: { $sum: 1 },
            // Subgroups by status for renewal
            statusBreakdown: {
              $push: {
                status: "$status",
                isRenewal: "$isRenewal",
              },
            },
          },
        },
      ]),
    ]);

    // Format status stats
    const statsFormatted = statusStats.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        acc.all += count;
        return acc;
      },
      { pending: 0, accredited: 0, declined: 0, revoked: 0, all: 0 }
    );

    // Add renewal stats
    const renewalCounts = renewalStats.reduce(
      (acc, { _id, count, statusBreakdown }) => {
        if (_id === true) {
          acc.renewal = count;
          // Count renewal by status
          acc.renewalByStatus = statusBreakdown.reduce((statAcc, item) => {
            statAcc[item.status] = (statAcc[item.status] || 0) + 1;
            return statAcc;
          }, {});
        }
        return acc;
      },
      { renewal: 0, renewalByStatus: {} }
    );

    // Combine all stats
    const combinedStats = {
      ...statsFormatted,
      ...renewalCounts,
    };

    res.status(200).json({
      success: true,
      companies,
      stats: combinedStats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// update about us
export const updateAboutUs = async (req, res) => {
  const companyId = req.companyId;

  try {
    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company Profile does not exist!",
      });
    }

    // Prepare update object
    const updateData = {};
    if (req.body.mission !== undefined) updateData.mission = req.body.mission;
    if (req.body.vision !== undefined) updateData.vision = req.body.vision;
    if (req.body.goals !== undefined) updateData.goals = req.body.goals;
    if (req.body.values !== undefined) updateData.values = req.body.values;
    if (req.body.facebook !== undefined)
      updateData.facebook = req.body.facebook;
    if (req.body.instagram !== undefined)
      updateData.instagram = req.body.instagram;
    if (req.body.twitter !== undefined) updateData.twitter = req.body.twitter;
    if (req.body.companyWebsite !== undefined)
      updateData.companyWebsite = req.body.companyWebsite;

    // Update the "About Us" section
    await Company.findByIdAndUpdate(
      companyId,
      { $set: { aboutUs: updateData } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "About Us information updated successfully!",
      data: updateData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// register company
export const registerCompany = async (req, res) => {
  try {
    const accountId = req.accountId;

    const {
      tinNumber,
      businessName,
      officeType,
      companySize,
      typeOfBusiness,
      industry,
      employerName,
      employerPosition,
      description,
      street,
      barangay,
      cityMunicipality,
      province,
      zipCode,
      mobileNumber,
      telephoneNumber,
      emailAddress,
    } = req.body;

    // Save company data to database
    const company = await Company.create({
      account: accountId,
      companyInformation: {
        tinNumber,
        businessName,
        officeType,
        companySize,
        typeOfBusiness,
        industry,
        employerName,
        employerPosition,
        description,
        street,
        barangay,
        cityMunicipality,
        province,
        zipCode,
        mobileNumber,
        telephoneNumber,
        emailAddress,
        companyLogo,
      },
    });

    res
      .status(201)
      .json({ message: "Company registered successfully", company });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// get company data
export const getCompanyData = async (req, res) => {
  try {
    const accountId = req.accountId;

    // Query the database for the company data based on accountId
    const companyData = await Company.findOne({ accountId });

    if (!companyData) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found!" });
    }

    // Return the company data if found
    res.status(200).json({ success: true, companyData });
  } catch (error) {
    console.error("Error in getCompanyData:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get company data by id
export const getCompanyDataById = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Query the database for the company data based on companyId
    const companyData = await Company.findById(companyId);
    if (!companyData) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found!" });
    }

    res.status(200).json({ success: true, companyData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// export const uploadCompanyDocuments = async (req, res) => {
//   try {
//     const companyId = req.companyId;

//     if (!companyId) {
//       return res.status(400).json({
//         success: false,
//         message: "Company ID is required",
//       });
//     }

//     const { typeOfBusiness } = req.body;

//     const requiredFiles = {
//       "sole proprietorship": ["mayorsPermit", "dti", "birRegistration"],
//       partnership: ["mayorsPermit", "dti", "birRegistration"],
//       corporation: ["mayorsPermit", "birRegistration"],
//       cooperative: ["mayorsPermit", "dti", "birRegistration"],
//     };

//     if (!requiredFiles[typeOfBusiness]) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid business type: ${typeOfBusiness}`,
//       });
//     }

//     const uploadFileSafely = async (file, folder) => {
//       if (file) {
//         return await cloudinary.uploader.upload(file.path, { folder });
//       }
//       throw new Error(`File is missing`);
//     };

//     // Store new uploads
//     const uploads = {};
//     for (const fileKey of Object.keys(req.files)) {
//       try {
//         const uploadResult = await uploadFileSafely(
//           req.files[fileKey][0],
//           `company_documents/${fileKey}`
//         );
//         uploads[fileKey] = {
//           url: uploadResult.secure_url,
//           originalName:
//             req.body[`${fileKey}OriginalName`] ||
//             req.files[fileKey][0].originalname,
//         };
//       } catch (error) {
//         console.warn(`Failed to upload ${fileKey}:`, error.message);
//       }
//     }

//     // Retrieve the accountId associated with this company
//     const company = await Company.findById(companyId);
//     if (!company) {
//       return res.status(404).json({
//         success: false,
//         message: "Company not found",
//       });
//     }

//     const accountId = company.accountId; // Get accountId from Company

//     const existingDocument = await CompanyDocuments.findOne({ companyId });

//     if (existingDocument) {
//       const isRenewal =
//         existingDocument.status === "verified" ||
//         existingDocument.status === "expired";

//       // **Update only the specific file fields, keeping the rest unchanged**
//       Object.assign(existingDocument, uploads, {
//         isRenewal,
//         status: "pending",
//       });

//       const updatedDocument = await existingDocument.save();

//       await Company.updateOne({ _id: companyId }, { isRenewal });

//       return res.status(200).json({
//         success: true,
//         message: "Selected documents successfully updated!",
//         updatedDocument,
//       });
//     }

//     // **If no document exists, create a new one**
//     const newCompanyDocuments = new CompanyDocuments({
//       companyId,
//       ...uploads,
//       isRenewal: false,
//       status: "pending",
//     });

//     const savedDocument = await newCompanyDocuments.save();

//     await Company.updateOne(
//       { _id: companyId },
//       { status: "pending", isRenewal: false }
//     );

//     // **Send Notification to All System Users (Admin & Staff)**
//     try {
//       const systemUsers = await Account.find({
//         role: { $in: ["admin", "staff"] },
//       }); // Fetch all admins and staff
//       console.log("System users found:", systemUsers.length);

//       for (const account of systemUsers) {
//         console.log(`Sending notification to: ${account._id}`);

//         await createNotification({
//           to: account._id, // Notify each admin and staff individually
//           from: accountId, // Company’s account ID (not companyId)
//           title: "Company Documents Updated",
//           message: `A company has updated their verification documents. Please review them for approval.`,
//           type: "info",
//           link: `/admin/company-verification/${companyId}`,
//         });
//       }
//     } catch (error) {
//       console.error("Error creating notifications for system users:", error);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Documents successfully uploaded!",
//       savedDocument,
//     });
//   } catch (error) {
//     console.error("Full error details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error!",
//     });
//   }
// };

export const uploadCompanyDocuments = async (req, res) => {
  try {
    const companyId = req.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const { typeOfBusiness } = req.body;

    const requiredFiles = {
      "sole proprietorship": ["mayorsPermit", "dti", "birRegistration"],
      partnership: ["mayorsPermit", "dti", "birRegistration"],
      corporation: ["mayorsPermit", "birRegistration"],
      cooperative: ["mayorsPermit", "dti", "birRegistration"],
    };

    if (!requiredFiles[typeOfBusiness]) {
      return res.status(400).json({
        success: false,
        message: `Invalid business type: ${typeOfBusiness}`,
      });
    }

    const uploadFileSafely = async (file, folder) => {
      if (file) {
        return await cloudinary.uploader.upload(file.path, { folder });
      }
      throw new Error(`File is missing`);
    };

    // Store new uploads
    const uploads = {};
    for (const fileKey of Object.keys(req.files)) {
      try {
        const uploadResult = await uploadFileSafely(
          req.files[fileKey][0],
          `company_documents/${fileKey}`
        );
        uploads[fileKey] = {
          url: uploadResult.secure_url,
          originalName:
            req.body[`${fileKey}OriginalName`] ||
            req.files[fileKey][0].originalname,
        };
      } catch (error) {
        console.warn(`Failed to upload ${fileKey}:`, error.message);
      }
    }

    // Retrieve the accountId associated with this company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const accountId = company.accountId; // Get accountId from Company
    const companyName =
      company.companyInformation?.businessName || "Unknown Company"; // Get company name

    let message;
    let savedDocument;

    const existingDocument = await CompanyDocuments.findOne({ companyId });

    // for existing documents
    if (existingDocument) {
      const isRenewal =
        existingDocument.status === "verified" ||
        existingDocument.status === "expired";

      // **Update only the specific file fields, keeping the rest unchanged**
      Object.assign(existingDocument, uploads, {
        isRenewal: true,
        status: "pending",
      });

      savedDocument = await existingDocument.save();

      await Company.updateOne({ _id: companyId }, { isRenewal: true });

      message = "Selected documents successfully updated!";
    } else {
      // **If no document exists, create a new one**
      savedDocument = new CompanyDocuments({
        companyId,
        ...uploads,
        isRenewal: false,
        status: "pending",
      });

      await savedDocument.save();

      await Company.updateOne(
        { _id: companyId },
        { status: "pending", isRenewal: false }
      );

      message = "Documents successfully uploaded!";
    }

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
          title: "Company Documents Updated",
          message: `${companyName} has updated their verification documents. Please review them for approval.`,
          type: "info",
          link: `/admin/company-verification/${companyId}`,
        });
      }
      console.log("Notifications sent successfully.");
    } catch (error) {
      console.error("Error creating notifications for system users:", error);
    }

    return res.status(200).json({
      success: true,
      message,
      savedDocument,
    });
  } catch (error) {
    console.error("Full error details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

export const getAllCompanyDocuments = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter query based on status
    const filter = status && status !== "all" ? { status } : {};

    // Fetch documents and statistics concurrently
    const [documents, stats] = await Promise.all([
      CompanyDocuments.find(filter)
        .populate(
          "companyId",
          "companyInformation.businessName companyInformation.employerName"
        )
        .sort({ createdAt: -1 }),
      CompanyDocuments.aggregate([
        {
          $group: {
            _id: "$status", // Group by the 'status' field
            count: { $sum: 1 }, // Count the number of documents for each status
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
      { pending: 0, verified: 0, declined: 0, all: 0 } // Default values
    );

    res.status(200).json({
      success: true,
      documents,
      stats: statsFormatted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get single company document
export const getCompanyDocument = async (req, res) => {
  const { documentId } = req.params;
  try {
    const document = await CompanyDocuments.findById(documentId).populate(
      "companyId"
    );
    if (!document) {
      res
        .status(400)
        .json({ success: false, message: "Company Document not found!" });
    }
    res.status(200).json({ success: true, document });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get company document by company id
export const getCompanyDocumentByCompanyId = async (req, res) => {
  const companyId = req.companyId;
  try {
    const documents = await CompanyDocuments.findOne({ companyId }).populate(
      "companyId"
    );
    if (!documents) {
      return res
        .status(400)
        .json({ success: false, message: "Company Document not found!" });
    }
    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get company document by company id for admin
export const getCompanyDocumentByCompanyIdAdmin = async (req, res) => {
  const { companyId } = req.params;

  try {
    const documents = await CompanyDocuments.findOne({ companyId }).populate(
      "companyId"
    );
    if (!documents) {
      return res
        .status(400)
        .json({ success: false, message: "Company Document not found!" });
    }
    res.status(200).json({ success: true, documents });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// update company document expiration
export const updateExpirationDates = async (req, res) => {
  const { companyId, updates } = req.body;

  if (!companyId || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const companyDocuments = await CompanyDocuments.findOne({ companyId });

    if (!companyDocuments) {
      return res.status(404).json({ message: "Company documents not found." });
    }

    let hasUpdates = false; // Flag to track if updates were made

    // Loop through updates and apply changes
    updates.forEach(({ documentType, expirationDate }) => {
      if (companyDocuments[documentType]) {
        const validDate = new Date(expirationDate);

        if (!isNaN(validDate.getTime())) {
          companyDocuments[documentType].expiresAt = validDate;
          hasUpdates = true;
        } else {
          console.warn(
            `Invalid expiration date for document type: ${documentType}`
          );
        }
      } else {
        console.warn(`Document type ${documentType} not found.`);
      }
    });

    if (!hasUpdates) {
      return res.status(400).json({
        message: "No valid updates were made.",
      });
    }

    companyDocuments.status = "verified";
    companyDocuments.gracePeriod = "false";
    companyDocuments.isRenewal = "false";

    // Save updated documents
    const savedDocument = await companyDocuments.save();
    if (!savedDocument) {
      throw new Error("Failed to save the document.");
    }

    // **Also update the Company's `isRenewal` to `true`**
    await Company.updateOne({ _id: companyId }, { isRenewal: false });

    return res.status(200).json({
      message: "Documents updated successfully.",
      updatedDocuments: updates,
    });
  } catch (error) {
    console.error("Error updating documents:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// decline company
export const declineCompany = async (req, res) => {
  const { companyId } = req.params;
  const { remarks } = req.body;
  const accountId = req.accountId;

  try {
    // Find the company and populate the account field to get the email
    const company = await Company.findById(companyId).populate("accountId");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Decline the company and save the remarks
    company.status = "declined";
    company.remarks = remarks || "";
    company.isRenewal = "false";
    company.accreditation = null;
    company.accreditationDate = null;
    company.accreditationId = null;
    await company.save();

    // Decline the associated company documents as well
    await CompanyDocuments.updateMany(
      { companyId: companyId },
      {
        $set: {
          status: "declined",
          remarks: remarks || "",
        },
      }
    );

    // Define email content
    const emailContent = {
      to: company?.accountId?.emailAddress, // Send to the email associated with the company
      subject: `Company Accreditation Declined: ${company?.companyInformation?.businessName}`,
      text: `Dear ${company?.companyInformation?.businessName},
      
    We regret to inform you that your company’s accreditation has been declined. The reason for the decline is as follows:
    
    Remarks: ${remarks || "No remarks provided"}
    
    If you wish to reapply or address any concerns, please feel free to contact us.
    
    Thank you for your understanding.
    
    Best regards,
    City Government of Taguig`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #f44336; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PESO City Government of Taguig</h1>
          </div>
        
          <h2 style="color: #2C3E50; text-align: center; margin-top: 20px; font-size: 22px;">Company Accreditation Declined</h2>
        
          <p style="font-size: 16px;">Dear ${
            company?.companyInformation?.businessName
          },</p>
        
          <p style="font-size: 16px;">We regret to inform you that your company’s accreditation has been declined. Below is the reason for the decline:</p>
        
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-left: 5px solid #f44336; border-radius: 5px; margin: 15px 0;">
            <strong>Remarks:</strong> ${remarks || "No remarks provided"}
          </div>
        
          <p style="font-size: 16px;">If you wish to reapply or address any concerns, please feel free to contact us.</p>
        
          <p style="text-align: center; margin-top: 20px;">
            <a href="" style="background-color: #f44336; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Us</a>
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

    // Send email using the sendEmail function
    await sendEmail(emailContent);

    // Notify the employer
    try {
      await createNotification({
        to: company?.accountId?._id, // Employer ID
        from: accountId, // admin / staff ID
        title: "Company Accreditation Declined",
        message: `Your company, ${company?.companyInformation?.businessName}, has been declined.`,
        type: "error",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    res
      .status(200)
      .json({ message: "Company declined and notified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// accredit company
export const accreditCompany = async (req, res) => {
  const { companyId } = req.params;
  const accountId = req.accountId;
  console.log(`ADMINISTRATOR ID = ${accountId}`);

  try {
    // Check if company document is verified
    const document = await CompanyDocuments.findOne({
      companyId: companyId,
    });

    if (document.status !== "verified") {
      return res.status(400).send({
        message: "Company document must be verified before accreditation",
      });
    }

    // Find the company and populate the accountId to get the email
    const company = await Company.findById(companyId).populate("accountId");

    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }

    // Generate a unique accreditation ID
    const accreditationId = `ACC-${new Date().getFullYear()}-${uuidv4()
      .slice(0, 8)
      .toUpperCase()}`;

    // Log the populated company object to check the accountId and email
    console.log("Populated Company:", company);

    // Assuming the accountId object has an email field
    const companyEmail = company.accountId?.emailAddress; // Use optional chaining to prevent undefined errors
    if (!companyEmail) {
      return res.status(400).send({ message: "Company email not found" });
    }

    const formatTIN = (tin) => {
      if (!tin) return "N/A"; // Handle cases where TIN is not provided
      const cleanedTIN = tin.replace(/\D/g, ""); // Remove non-numeric characters
      if (cleanedTIN.length === 9) {
        return cleanedTIN.replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3"); // Format as XXX-XXX-XXX
      } else if (cleanedTIN.length === 12) {
        return cleanedTIN.replace(
          /(\d{3})(\d{3})(\d{3})(\d{3})/,
          "$1-$2-$3-$4"
        ); // Format as XXX-XXX-XXX-XXX
      }
      return cleanedTIN; // Return as-is if it doesn't match expected lengths
    };

    // Use the formatted TIN in the HTML content
    const formattedTIN = formatTIN(company?.companyInformation?.tinNumber);

    // Define HTML content for the accreditation certificate
    const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #fff;
      width: 210mm; /* A4 width */
      height: 297mm; /* A4 height */
      min-height: 100vh;
      box-sizing: border-box;
    }
    .document {
      padding: 20mm; /* Adjust padding to fit within A4 */
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 2px solid #1a5f7a;
      margin-bottom: 40px;
    }
    .logo {
      width: 100px;
      height: 100px;
      margin: 0 auto 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .government-title {
      color: #333;
      margin: 0;
      font-size: 14px;
    }
    .office-title {
      color: #1a5f7a;
      margin: 8px 0;
      font-size: 18px;
      font-weight: bold;
    }
    .document-title {
      font-size: 24px;
      color: #1a5f7a;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 20px 0;
      text-align: center;
      font-weight: bold;
    }
    .overview-box {
      border: 2px solid #1a5f7a;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      background-color: #f8f9fa;
    }
    .overview-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    .overview-main {
      border-right: 1px solid #ddd;
      padding-right: 20px;
    }
    .overview-status {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 20px;
    }
    .status-badge {
      background-color: #2e7d32;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .content-box {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 25px;
      margin-bottom: 30px;
      background-color: #f9f9f9;
    }
    .section-title {
      color: #1a5f7a;
      font-size: 18px;
      margin-bottom: 20px;
      font-weight: bold;
      border-bottom: 2px solid #1a5f7a;
      padding-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-item {
      margin-bottom: 15px;
    }
    .label {
      color: #666;
      font-size: 13px;
      margin-bottom: 3px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .value {
      color: #333;
      font-size: 15px;
      font-weight: 500;
      padding: 2px 0;
    }
    .overview-item {
      margin-bottom: 12px;
    }
    .overview-item .label {
      font-size: 12px;
    }
    .overview-item .value {
      font-size: 16px;
      color: #1a5f7a;
    }
    .company-name {
      font-size: 20px;
      color: #1a5f7a;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="logo">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s" alt="Taguig City Logo" />
      </div>
      <h4 class="government-title">Republic of the Philippines</h4>
      <h3 class="office-title">City Government of Taguig</h3>
      <h3 class="office-title">Public Employment Service Office</h3>
    </div>

    <h1 class="document-title">Proof of Accreditation</h1>

    <div class="overview-box">
      <div class="overview-grid">
        <div class="overview-main">
          <div class="company-name">${
            company?.companyInformation?.businessName
          }</div>
          <div class="overview-item">
            <div class="label">Tax Identification Number (TIN)</div>
            <div class="value">${formattedTIN}</div>
          </div>
          <div class="overview-item">
            <div class="label">Business Address</div>
            <div class="value">
    ${
      [
        company?.companyInformation?.street,
        company?.companyInformation?.barangay,
        company?.companyInformation?.cityMunicipality,
        company?.companyInformation?.province,
        company?.companyInformation?.zipCode,
      ]
        .filter(Boolean) // Remove undefined or null values
        .join(", ") // Join with a comma and a space
    }
  </div>
          </div>
          <div class="overview-item">
            <div class="label">Accreditation ID</div>
            <div class="value">${accreditationId}</div>
          </div>
        </div>
        <div class="overview-status">
          <div class="status-badge">ACCREDITED</div>
          <div style="font-size: 13px; color: #666;">
            Date of Accreditation<br/>
            ${new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>

    <div class="content-box">
      <h2 class="section-title">Company Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">Type of Business</div>
          <div class="value">${
            company?.companyInformation?.typeOfBusiness
          }</div>
        </div>
        <div class="info-item">
          <div class="label">Industry</div>
          <div class="value">${company?.companyInformation?.industry}</div>
        </div>
        <div class="info-item">
          <div class="label">Employer Name</div>
          <div class="value">${company?.companyInformation?.employerName}</div>
        </div>
        <div class="info-item">
          <div class="label">Employer Position</div>
          <div class="value">${
            company?.companyInformation?.employerPosition
          }</div>
        </div>
        <div class="info-item">
          <div class="label">Contact Number</div>
          <div class="value">${company?.companyInformation?.mobileNumber}</div>
        </div>
        <div class="info-item">
          <div class="label">Email Address</div>
          <div class="value">${company?.accountId?.emailAddress}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This document is officially generated by the City Government of Taguig Public Employment Service Office (PESO).</p>
      <p>Date Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Upload PDF to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "company_accreditations", use_filename: true },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(pdfBuffer);
    });

    // Update the company with accreditation details
    company.accreditation = result.secure_url;
    company.status = "accredited";
    company.isRenewal = "false";
    company.accreditationDate = new Date(); // Set the accreditation date
    company.accreditationId = accreditationId; // Save the accreditation ID
    await company.save();

    // Prepare email content
    const emailContent = {
      to: companyEmail, // Send to the email associated with the company
      subject: `Accreditation Certificate for ${company?.companyInformation?.businessName}`,
      text: `Dear ${company?.companyInformation?.businessName},
    
    We are pleased to inform you that your company has been accredited. Please find the accreditation certificate attached.
    
    Thank you for your cooperation.
    
    Best regards,
    City Government of Taguig`,
      html: `
        <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; background-color: #007BFF; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PESO City Government of Taguig</h1>
          </div>
    
          <h2 style="color: #2C3E50; text-align: center; margin-top: 20px; font-size: 22px;">Accreditation</h2>
    
          <p style="font-size: 16px;">Dear ${company?.companyInformation?.businessName},</p>
    
          <p style="font-size: 16px;">We are pleased to inform you that your company has been accredited. Please find the proof of accreditation attached.</p>
    
          <p style="font-size: 16px;">If you wish to view or download the proof of document, please click the button below:</p>
    
          <p style="text-align: center;">
            <a href="" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Accreditation Certificate</a>
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

    // Send the email notification with the PDF attachment
    await sendEmail(emailContent);

    // Notify the employer
    try {
      console.log(`ACCOUNT ID = ${company?.accountId?._id}`);
      await createNotification({
        to: company?.accountId?._id, // Employer ID
        from: accountId, // admin / staff ID
        title: "Company Accredited",
        message: `Your company, ${company?.companyInformation?.businessName}, has been successfully accredited.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }

    res.status(200).send({
      message:
        "Accreditation certificate generated, saved successfully, and email sent.",
      company,
    });
  } catch (error) {
    console.error("Error accrediting company:", error);
    res.status(500).send({ message: "Failed to accredit company" });
  }
};

// update candidate preferences
export const updateCandidatePreferences = async (req, res) => {
  const companyId = req.companyId; // Assuming companyId is available from req.company
  const { educationalLevels, skills, specializations } = req.body;

  try {
    // Find the company by companyId
    const company = await Company.findById(companyId);

    // If the company doesn't exist, return an error
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check if candidatePreferences exists, if not, create it
    if (!company.candidatePreferences) {
      company.candidatePreferences = {}; // Initialize candidatePreferences if not already present
    }

    // Update or set candidate preferences
    company.candidatePreferences.educationalLevels = educationalLevels.filter(
      (level) => level.trim() !== ""
    );
    company.candidatePreferences.skills = skills.filter(
      (skill) => skill.trim() !== ""
    );
    company.candidatePreferences.specializations = specializations.filter(
      (specialization) => specialization.trim() !== ""
    );

    // Save the updated company document
    const updatedCompany = await company.save();

    // Return the updated candidate preferences
    return res.status(200).json({
      message: "Candidate preferences updated successfully",
      candidatePreferences: updatedCompany.candidatePreferences,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error updating candidate preferences",
      error: error.message,
    });
  }
};

// get all accredited companies
export const getAllAccreditedCompanies = async (req, res) => {
  try {
    const accreditedCompanies = await Companies.find({
      status: "accredited",
    }).sort({ accreditationDate: -1 });
    res.status(200).json({ accreditedCompanies });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get all accredited companies
export const getAccreditedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ status: "accredited" }).sort({
      accreditationDate: -1,
    });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get renewals
export const getRenewals = async (req, res) => {
  try {
    const companies = await Company.find({ isRenewal: true });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.log(error);
    res
      .stattus(500)
      .json({ success: false, message: "Internal server error!" });
  }
};
