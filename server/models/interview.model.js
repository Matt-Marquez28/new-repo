import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    interviewerName: {
      type: String,
      required: [true, "Please provide an interviewer name."],
      trim: true,
    },
    emailAddress: {
      type: String,
      required: [true, "Please provide an email address."],
      trim: true,
      match: [/.+@.+\..+/, "Invalid email address"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Please provide a mobile number."],
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid mobile number."],
    },
    interviewDate: {
      type: Date,
      required: [true, "Please provide an interview date."],
    },
    interviewTime: {
      type: String,
      required: [true, "Please provide an interview time."],
    },
    interviewLocation: {
      type: String,
      required: [true, "Please provide an interview location."],
      trim: true,
    },
    interviewLink: {
      type: String,
      trim: true,
    },
    interviewNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: "String",
      enum: ["interview scheduled", "interview completed"],
      default: "interview scheduled",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
