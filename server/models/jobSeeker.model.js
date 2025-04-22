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
      height: {
        type: String,
        required: true,
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
      // zipCode: {
      //   type: String,
      //   required: true,
      //   trim: true,
      // },
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
    employmentStatus: {
      status: {
        type: String,
        enum: ["employed", "unemployed"],
        required: true,
      },
      employedDetails: {
        employmentType: {
          type: String,
          enum: ["wage-employed", "self-employed"],
          required: function () {
            return this.parent().status === "employed";
          },
        },
        selfEmployment: {
          detail: {
            type: String,
            enum: [
              "Fisherman / Fisherfolk",
              "Vendor / Retailer",
              "Home-based worker",
              "Transport",
              "Domestic Worker",
              "Freelancer",
              "Artisan / Craft Worker",
              "Others",
            ],
            required: function () {
              return this.parent().employmentType === "self-employed";
            },
          },
          otherDetail: {
            type: String,
            trim: true,
            required: function () {
              return this.parent().detail === "Others";
            },
          },
        },
      },
      unemployedDetails: {
        reason: {
          type: String,
          enum: [
            "New Entrant / Fresh Graduate",
            "Finished Contract",
            "Resigned",
            "Retired",
            "Terminated / Laid off due to calamity",
            "Terminated / Laid off (local)",
            "Terminated / Laid off (abroad)",
            "Others",
          ],
          required: function () {
            return this.parent().parent().status === "unemployed";
          },
        },
        otherReason: {
          type: String,
          trim: true,
          required: function () {
            return this.parent().reason === "Others";
          },
        },
        monthsLookingForWork: {
          type: Number,
          min: 0,
          max: 120, // 10 years seems reasonable maximum
          required: function () {
            return this.parent().parent().status === "unemployed";
          },
        },
      },
    },
    disability: {
      hasDisability: Boolean,
      types: [String], // Array of specific types (excluding "none")
      otherDescription: String,
    },
    languages: [{ type: Object, required: false }],
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
    eligibilities_and_licences: {
      eligibilities: [
        {
          civilService: { type: String, required: true, trim: true },
          dateTaken: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],

      professionalLicenses: [
        {
          prc: { type: String, required: true, trim: true },
          validUntil: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
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
    trainings: [
      {
        trainingName: String,
        hours: Number,
        institution: String,
        skills: [String], // Array of strings
        certificate: String,
        // startDate: Date,
        // endDate: Date,
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

// Add this right BEFORE creating the model
jobSeekerSchema.methods.checkProfileCompleteness = function () {
  const incompleteSections = [];

  // Check personal information
  const requiredPersonalInfo = [
    "firstName",
    "lastName",
    "gender",
    "civilStatus",
    "birthDate",
    "height",
    "street",
    "barangay",
    "cityMunicipality",
    "province",
    "emailAddress",
    "mobileNumber",
  ];

  for (const field of requiredPersonalInfo) {
    if (!this.personalInformation[field]) {
      incompleteSections.push("personalInformation");
      break;
    }
  }

  // Check employment status
  if (!this.employmentStatus || !this.employmentStatus.status) {
    incompleteSections.push("employmentStatus");
  } else if (this.employmentStatus.status === "employed") {
    if (
      !this.employmentStatus.employedDetails ||
      !this.employmentStatus.employedDetails.employmentType
    ) {
      incompleteSections.push("employmentStatus");
    }
  } else if (this.employmentStatus.status === "unemployed") {
    if (
      !this.employmentStatus.unemployedDetails ||
      !this.employmentStatus.unemployedDetails.reason ||
      this.employmentStatus.unemployedDetails.monthsLookingForWork === undefined
    ) {
      incompleteSections.push("employmentStatus");
    }
  }

  // Check disability information
  if (
    this.disability === undefined ||
    this.disability.hasDisability === undefined
  ) {
    incompleteSections.push("disability");
  } else if (
    this.disability.hasDisability === true &&
    (!this.disability.types || this.disability.types.length === 0)
  ) {
    incompleteSections.push("disability");
  }

  // Check languages (at least one language required)
  if (!this.languages || this.languages.length === 0) {
    incompleteSections.push("languages");
  }

  // Check educational background (at least one entry required)
  if (!this.educationalBackground || this.educationalBackground.length === 0) {
    incompleteSections.push("educationalBackground");
  } else {
    // Check required fields in each education entry
    const requiredEducationFields = [
      "degree_or_qualifications",
      "fieldOfStudy",
      "institutionName",
      "location",
      "startDate",
    ];

    for (const education of this.educationalBackground) {
      for (const field of requiredEducationFields) {
        if (!education[field]) {
          incompleteSections.push("educationalBackground");
          break;
        }
      }
      if (incompleteSections.includes("educationalBackground")) break;
    }
  }

  // Check skills (at least one core skill)
  if (
    !this.skillsAndSpecializations ||
    !this.skillsAndSpecializations.coreSkills ||
    this.skillsAndSpecializations.coreSkills.length === 0
  ) {
    incompleteSections.push("skillsAndSpecializations");
  }

  return {
    isComplete: incompleteSections.length === 0,
    incompleteSections,
  };
};

const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);

export default JobSeeker;
