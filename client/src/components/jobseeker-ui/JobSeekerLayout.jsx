import React from "react";
import { Outlet } from "react-router-dom";
import { JobSeekerHeader } from "./JobSeekerHeader";

const JobSeekerLayout = () => {
  return (
    <div className="vh-100">
      <JobSeekerHeader />
      <main className="flex-grow-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default JobSeekerLayout;
