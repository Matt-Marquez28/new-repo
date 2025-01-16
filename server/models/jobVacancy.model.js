import mongoose from "mongoose";

const jobVacancySchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["permanent", "part-time", "temporary", "contractual"],
      required: true,
    },
    workLocation: {
      type: String,
      required: true,
    },
    salaryType: {
      type: String,
      required: true,
    },
    salaryMin: {
      type: Number,
      required: true,
      min: 0,
    },
    salaryMax: {
      type: Number,
      required: true,
      // validate: {
      //   validator: function (value) {
      //     return value > this.salaryMin;
      //   },
      //   message: "Maximum salary must be greater than minimum salary.",
      // },
      min: 1,
    },
    vacancies: {
      type: Number,
      required: true,
      min: [1, "There must be at least one vacancy"],
    },
    description: {
      type: String,
      required: true,
    },
    requiredQualifications: {
      type: [String],
      required: true,
    },
    responsibilities: {
      type: [String],
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    interviewProcess: {
      type: String,
      required: false,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobSeeker",
      },
    ],
    status: {
      type: String,
      enum: ["ongoing", "expired", "archived"],
      default: "ongoing",
    },
    publicationStatus: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// unique compound index for accountId and jobTitle
jobVacancySchema.index({ accountId: 1, jobTitle: 1 }, { unique: true });

const JobVacancy = mongoose.model("JobVacancy", jobVacancySchema);

export default JobVacancy;
