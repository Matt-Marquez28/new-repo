import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define the email details
const message = {
  to: "vanmarquez999@gmail.com", // Recipient email
  from: "mattjovan.marquez28@gmail.com", // Verified sender email
  subject: "Hello from SendGrid with ESM and dotenv",
  text: "This is a plain text email.",
  html: "<strong>This is an HTML email.</strong>",
};

// Send the email
sgMail
  .send(message)
  .then(() => {
    console.log("Email sent successfully!");
  })
  .catch((error) => {
    console.error("Error sending email:", error.response.body);
  });
