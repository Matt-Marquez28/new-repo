import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobSeeker",
      required: true,
    },
    jobVacancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobVacancy",
      required: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
    remarks: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "interview scheduled",
        "interview completed",
        "hired",
        "declined",
      ],
      default: "pending",
    },
    hiredDate: {
      type: Date,
      required: false,
    },
    remarks: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
