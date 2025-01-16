import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  emailAddress: { type: String, required: true }, // User's email address
  token: { type: String, required: true }, // Unique reset token
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date and time
    expires: 600, // Automatically delete the document after 600 seconds (10 minutes)
  },
});

const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
export default ResetToken;
