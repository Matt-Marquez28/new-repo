import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  emailAddress: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date and time
    expires: 60, // Expire after 60 seconds (1 minute)
  },
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;