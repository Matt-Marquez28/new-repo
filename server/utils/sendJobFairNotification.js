import { sendEmail } from "./email.js";
import { Account } from "../models/account.model.js";
import { createNotification } from "./notification.js";

export const sendJobFairNotifications = async (event) => {
  try {
    const eventDate = new Date(event.date).toLocaleDateString();
    const subject = `New Job Fair Announcement: ${event.title}`;

    const generateEmailHtml = (customMessage) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Job Fair Opportunity!</h2>
            <p>Hello,</p>
            <p>We're excited to announce a new job fair event that might interest you:</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">${event.title}</h3>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              <p><strong>Venue:</strong> ${event.venue}</p>
              <p><strong>Description:</strong> ${event.description}</p>
              <p><strong>Registration Deadline:</strong> ${new Date(
                event.registrationDeadline
              ).toLocaleDateString()}</p>
            </div>
    
            <p>${customMessage}</p>
    
            <a href="https://peso-city-of-taguig.onrender.com/" 
               style="display: inline-block; background: #0066cc; color: white; 
                      padding: 10px 15px; text-decoration: none; border-radius: 3px;">
              Register Now
            </a>
    
            <p style="font-size: 12px; color: #777; margin-top: 20px;">
              You're receiving this email because you have an account with us. 
              <a href="https://peso-city-of-taguig.onrender.com/" style="color: #0066cc;">Unsubscribe</a>
            </p>
          </div>
        `;

    // Get all verified and active accounts by role
    const [jobSeekers, employers] = await Promise.all([
      Account.find(
        {
          role: "jobseeker",
          isActive: true,
          isBlocked: false,
          deletedAt: null,
        },
        "emailAddress _id"
      ),
      Account.find(
        { role: "employer", isActive: true, isBlocked: false, deletedAt: null },
        "emailAddress _id"
      ),
    ]);

    // Common notification details
    const notificationDetails = {
      from: null, // or set to system/admin ID if applicable
      title: `New Job Fair: ${event.title}`,
      message: `A new job fair is scheduled for ${eventDate} at ${event.venue}.`,
      type: "info",
      link: "/job-fairs", // or a more specific link
    };

    // Send to job seekers individually
    for (const seeker of jobSeekers) {
      // Send email
      await sendEmail({
        to: seeker.emailAddress,
        subject,
        html: generateEmailHtml(
          `Don't miss this opportunity to connect with ${employers.length} potential employers!`
        ),
        text: `New Job Fair: ${event.title} on ${eventDate} at ${event.venue}. Description: ${event.description}`,
      });

      // Send in-app notification
      await createNotification({
        ...notificationDetails,
        to: seeker._id,
        message: `Connect with ${employers.length} employers at our upcoming job fair!`,
      });
    }

    // Send to employers individually
    for (const employer of employers) {
      // Send email
      await sendEmail({
        to: employer.emailAddress,
        subject,
        html: generateEmailHtml(
          `Don't miss this opportunity to connect with talented job seekers!`
        ),
        text: `New Job Fair: ${event.title} on ${eventDate} at ${event.venue}. Description: ${event.description}`,
      });

      // Send in-app notification
      await createNotification({
        ...notificationDetails,
        to: employer._id,
        message: `Meet talented job seekers at our upcoming job fair!`,
      });
    }

    console.log(
      `✅ Notifications sent individually to ${jobSeekers.length} job seekers and ${employers.length} employers`
    );
  } catch (error) {
    console.error("❌ Error sending job fair notifications:", error);
  }
};
