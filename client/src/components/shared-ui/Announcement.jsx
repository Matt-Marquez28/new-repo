import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { JOB_VACANCY_API_END_POINT } from "../../utils/constants";
// import { CloseOutlined } from "@ant-design/icons"; // Optional close icon
import { Link } from "react-router-dom";

const Announcement = () => {
  const [visible, setVisible] = useState(true);
  const [event, setEvent] = useState(null);

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

        console.log("Deadline:", deadline.format(), "| Now:", now.format());

        // Only set event if deadline is still in the future
        if (deadline.isAfter(now)) {
          setEvent(fetchedEvent);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, []);

  if (!visible || !event) return null;

  return (
    <div
      style={{
        backgroundColor: "#1890ff",
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
        🎉 <strong>Job Fair:</strong> Registration open until{" "}
        {dayjs(event.registrationDeadline).format("MMM D")} •
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

      {/* Optional close button */}
      {/* <CloseOutlined
        style={{
          cursor: "pointer",
          position: "absolute",
          right: "8px",
          fontSize: "12px",
        }}
        onClick={() => setVisible(false)}
      /> */}
    </div>
  );
};

export default Announcement;
