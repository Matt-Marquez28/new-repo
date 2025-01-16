import Token from "../models/token.model.js";
const bcrypt = require("bcryptjs");
import { sendEmail } from "../utils/email";

// export const generateOTP = async (req, res) => {
//   const { email } = req.body;

//   try {
//     // check if email is provided
//     if (!email) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email is required!" });
//     }

//     // generate 6 digit OTP
//     const otp = Math.floor(100000 + Math.random() * 9000000);

//     // set expiration date time
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     // hash the OTP
//     const hashedOtp = await bcrypt.hash(otp.toString(), 10);

//     // Save the OTP hash in the database
//     await Token.create({ email, otp: hashedOtp, expiresAt });

//     // email later

//     res.status(200).json({success: true, message: "token has been created!"});
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: "Internal server error!" });
//   }
// };
