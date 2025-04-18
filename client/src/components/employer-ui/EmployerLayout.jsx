import React from "react";
import { Outlet } from "react-router-dom";
import { EmployerHeader } from "./EmployerHeader";
import Announcement from "../shared-ui/Announcement";

const EmployerLayout = () => {
  return (
    <div className="vh-100">
      <Announcement />
      <EmployerHeader />
      <main className="flex-grow-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployerLayout;
