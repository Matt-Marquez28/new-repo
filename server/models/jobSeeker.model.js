import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    personalInformation: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      middleName: {
        type: String,
        trim: true,
      },
      suffix: {
        type: String,
        trim: true,
      },
      gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"],
      },
      civilStatus: {
        type: String,
        required: true,
        enum: ["single", "married", "divorced", "widowed"],
      },
      birthDate: {
        type: Date,
        required: true,
      },
      educationalLevel: {
        type: String,
        required: false,
      },
      street: {
        type: String,
        required: true,
        trim: true,
      },
      barangay: {
        type: String,
        required: true,
        trim: true,
      },
      cityMunicipality: {
        type: String,
        required: true,
        trim: true,
      },
      province: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      emailAddress: {
        type: String,
        required: true,
        match: [
          /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
          "Please enter a valid email address",
        ],
      },
      mobileNumber: {
        type: String,
        required: true,
        match: [
          /^(09|\+639)\d{9}$/,
          "Please enter a valid Philippine phone number",
        ],
      },
      photo: {
        type: String,
      },
      aboutMe: {
        type: String,
        required: false,
      },
    },
    skillsAndSpecializations: {
      specializations: {
        type: [String],
        default: [""],
      },
      coreSkills: {
        type: [String],
        default: [""],
      },
      softSkills: {
        type: [String],
        default: [""],
      },
    },
    workExperience: [
      {
        jobTitle: {
          type: String,
          required: true,
          trim: true,
        },
        companyName: {
          type: String,
          required: true,
          trim: true,
        },
        location: {
          type: String,
          required: true,
          trim: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          type: Date,
          required: function () {
            return !this.currentlyWorking;
          },
        },
        currentlyWorking: {
          type: Boolean,
          default: false,
        },
        keyResponsibilities: {
          type: [String],
          default: undefined,
        },
        achievements_and_contributions: {
          type: [String],
          default: undefined,
        },
        skills_and_tools_used: {
          type: [String],
          default: undefined,
        },
        proofOfWorkExperienceDocuments: [
          {
            url: { type: String },
            originalName: { type: String },
          },
        ],
      },
    ],
    jobPreferences: {
      jobPositions: {
        type: [String],
        default: [""], // Default to an array with one empty string
      },
      locations: {
        type: [String],
        default: [""], // Default to an array with one empty string
      },
      salaryType: {
        type: String,
        enum: ["hourly", "monthly"],
        default: "monthly", // Default to an array with one empty string
      },
      salaryMin: {
        type: Number,
        default: 0, // Default to 0 salary
      },
      salaryMax: {
        type: Number,
        default: 0, // Default to 0 salary
      },
      employmentType: {
        type: String,
        enum: ["permanent", "part-time", "temporary", "contractual"],
        default: "permanent", // Default to "permanent"
      },
      industries: {
        type: [String],
        default: [""], // Default to an array with one empty string
      },
    },
    educationalBackground: [
      {
        degree_or_qualifications: {
          type: String,
          required: true,
        },
        fieldOfStudy: {
          type: String,
          required: true,
        },
        institutionName: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: function () {
            return !this.currentlyStudying;
          },
        },
        currentlyStudying: {
          type: Boolean,
          default: false,
        },
        achievements: [
          {
            type: String,
            trim: true,
          },
        ],
        relevantCoursework: [
          {
            type: String,
            trim: true,
          },
        ],
        certifications: [
          {
            type: String,
            trim: true,
          },
        ],
        // proofOfEducationDocuments: [{ type: String }],
        proofOfEducationDocuments: [
          {
            url: { type: String },
            originalName: { type: String },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["incomplete", "pending", "verified", "declined"],
      default: "incomplete",
    },
    savedJobVacancies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobVacancy",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);

export default JobSeeker;
