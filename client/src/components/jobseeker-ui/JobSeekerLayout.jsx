import React from "react";
import { Outlet } from "react-router-dom";
import { JobSeekerHeader } from "./JobSeekerHeader";
import Announcement from "../shared-ui/Announcement";

const JobSeekerLayout = () => {
  return (
    <div className="vh-100">
      <Announcement events={[{ registrationDeadline: "2025-05-01" }]}/>
      <JobSeekerHeader />
      <main className="flex-grow-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default JobSeekerLayout;
