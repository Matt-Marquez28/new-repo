// emailService.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Reusable function to send email
export const sendEmail = async ({ to, subject, text, html }) => {
  const message = {
    to,
    from: "pesocityoftaguig@gmail.com", // verified sender email
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(message);
    console.log("Email sent successfully!");
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("Error response:", error.response.body);
    } else {
      console.error("Error sending email:", error.message);
    }
  }
};
