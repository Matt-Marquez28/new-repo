import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Link } from "react-router-dom";

const Announcement = () => {
  const [visible, setVisible] = useState(true);
  const [event, setEvent] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [isBeforeEvent, setIsBeforeEvent] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `${JOB_VACANCY_API_END_POINT}/get-active-job-fair-event`
        );

        const fetchedEvent = res.data.activeJobFair;

        if (!fetchedEvent || !fetchedEvent.date) {
          console.warn("No active job fair event or missing date");
          return;
        }

        const eventDate = dayjs(fetchedEvent.date);
        const now = dayjs();

        if (eventDate.isAfter(now)) {
          setEvent(fetchedEvent);
          startCountdown(fetchedEvent);
          setIsBeforeEvent(true);
        } else {
          setIsBeforeEvent(false);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    const startCountdown = (event) => {
      const updateCountdown = () => {
        const now = dayjs();
        const registrationDeadline = dayjs(event.registrationDeadline);
        const eventDate = dayjs(event.date);

        // Check if event date has passed
        if (eventDate.isBefore(now)) {
          setIsBeforeEvent(false);
          setVisible(false);
          return;
        }

        // Determine which countdown to show (registration deadline or event date)
        let targetDate = registrationDeadline.isAfter(now) 
          ? registrationDeadline 
          : eventDate;
        
        let messagePrefix = registrationDeadline.isAfter(now)
          ? "Registration closes in"
          : "Job Fair starts in";

        const diff = targetDate.diff(now, 'second');

        if (diff <= 0) {
          if (targetDate === registrationDeadline) {
            // Switch to event date countdown
            targetDate = eventDate;
            messagePrefix = "Job Fair starts in";
            const newDiff = targetDate.diff(now, 'second');
            if (newDiff <= 0) {
              setVisible(false);
              return;
            }
          } else {
            setVisible(false);
            return;
          }
        }

        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        const seconds = diff % 60;

        let countdownStr = "";
        if (days > 0) countdownStr += `${days} day${days !== 1 ? 's' : ''} `;
        if (hours > 0 || days > 0) countdownStr += `${hours} hour${hours !== 1 ? 's' : ''} `;
        if (days === 0) {
          countdownStr += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
          if (hours === 0) {
            countdownStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;
          }
        }

        setCountdown(`${messagePrefix} ${countdownStr.trim()}`);
      };

      updateCountdown(); // Initial call
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    };

    fetchEvent();
  }, []);

  if (!visible || !event || !isBeforeEvent) return null;

  return (
    <div
      style={{
        backgroundColor: "#ed1b24",
        color: "white",
        padding: "2px 16px",
        fontSize: "12px",
        textAlign: "center",
        height: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span>
        🎉 <strong>Job Fair:</strong> {countdown} •
        <Link
          to="job-fair"
          style={{
            color: "white",
            marginLeft: "6px",
            textDecoration: "underline",
          }}
        >
          {dayjs().isBefore(dayjs(event.registrationDeadline)) ? "Register now" : "View details"}
        </Link>
      </span>
    </div>
  );
};

export default Announcement;