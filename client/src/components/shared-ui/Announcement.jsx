import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
import { Link } from "react-router-dom";

const Announcement = () => {
  const [visible, setVisible] = useState(true);
  const [event, setEvent] = useState(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(
          `${JOB_VACANCY_API_END_POINT}/get-active-job-fair-event`
        );

        const fetchedEvent = res.data.activeJobFair;

        if (!fetchedEvent || !fetchedEvent.registrationDeadline) {
          console.warn(
            "No active job fair event or missing registrationDeadline"
          );
          return;
        }

        const deadline = dayjs(fetchedEvent.registrationDeadline);
        const now = dayjs();

        if (deadline.isAfter(now)) {
          setEvent(fetchedEvent);
          startCountdown(deadline);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    const startCountdown = (deadline) => {
      const updateCountdown = () => {
        const now = dayjs();
        const diff = deadline.diff(now, 'second');

        if (diff <= 0) {
          setVisible(false);
          return;
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

        setCountdown(countdownStr.trim());
      };

      updateCountdown(); // Initial call
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    };

    fetchEvent();
  }, []);

  if (!visible || !event) return null;

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
        🎉 <strong>Job Fair:</strong> Registration closes in {countdown} •
        <Link
          to="job-fair"
          style={{
            color: "white",
            marginLeft: "6px",
            textDecoration: "underline",
          }}
        >
          Register now
        </Link>
      </span>
    </div>
  );
};

export default Announcement;