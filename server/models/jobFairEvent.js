import mongoose from "mongoose";

// models/JobFairEvent.js
const jobFairEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true }, // e.g., "Convention Center, Room 101"
    description: { type: String, required: false },
    registrationDeadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const JobFairEvent = mongoose.model("JobFairEvent", jobFairEventSchema);
export default JobFairEvent;
