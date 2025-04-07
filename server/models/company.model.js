import mongoose from "mongoose";
import { type } from "os";

const companySchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    companyInformation: {
      tinNumber: {
        type: String,
        required: true,
      },
      businessName: {
        type: String,
        required: true,
      },
      officeType: {
        type: String,
        required: true,
        enum: ["main", "branch"],
      },
      companySize: {
        type: String,
        enum: ["micro", "small", "medium", "large"],
        required: true,
      },
      typeOfBusiness: {
        type: String,
        required: true,
      },
      industry: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      employerName: {
        type: String,
        required: true,
      },
      employerPosition: {
        type: String,
        required: true,
      },
      unitNumber: {
        type: String,
        required: false,
      },
      street: {
        type: String,
        required: false,
      },
      barangay: {
        type: String,
        required: true,
      },
      cityMunicipality: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      contactPersonName: {
        type: String,
      },
      mobileNumber: {
        type: String,
        required: true,
      },
      telephoneNumber: {
        type: String,
        required: false, // Optional field
      },
      emailAddress: {
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      },
      companyLogo: {
        type: String,
        required: false,
      },
    },
    aboutUs: {
      mission: {
        type: String,
        required: false,
      },
      vision: {
        type: String,
        required: false,
      },
      goals: {
        type: String,
        required: false,
      },
      values: {
        type: String,
        required: false,
      },
      facebook: {
        type: String,
        required: false,
      },
      instagram: {
        type: String,
        required: false,
      },
      twitter: {
        type: String,
        required: false,
      },
      companyWebsite: {
        type: String,
        required: false,
      },
    },
    candidatePreferences: {
      educationalLevels: [
        {
          type: String,
          default: "",
        },
      ],
      specializations: [
        {
          type: String,
          default: "",
        },
      ],
      skills: [
        {
          type: String,
          default: "",
        },
      ],
    },
    jobVacancies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobVacancy",
      },
    ],
    accreditation: {
      type: String,
      required: false,
    },
    accreditationId: {
      type: String,
      required: false,
    },
    accreditationDate: {
      type: Date,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
    isRenewal: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["incomplete", "pending", "accredited", "declined", "revoked"],
      default: "incomplete",
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
