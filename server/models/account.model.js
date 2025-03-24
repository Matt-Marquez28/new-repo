import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const accountSchema = new mongoose.Schema(
  {
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
    mobileNumber: {
      type: String,
      required: false,
      trim: true,
      match: [
        /^(09|\+639)\d{9}$/,
        "Please fill a valid Philippine mobile number",
      ],
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Please fill a valid email address",
      ],
      unique: true, // Ensuring uniqueness of email addresses
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["jobseeker", "employer", "admin", "staff"],
    },
    status: {
      type: String,
      enum: ["temporary", "verified"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// You might want to add a custom method to check for email/username login
accountSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Account = mongoose.model("Account", accountSchema);
