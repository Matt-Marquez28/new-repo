import mongoose from "mongoose";

const jobInvitationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);

const JobInvitation = mongoose.model("JobInvitation", jobInvitationSchema);

export default JobInvitation;
