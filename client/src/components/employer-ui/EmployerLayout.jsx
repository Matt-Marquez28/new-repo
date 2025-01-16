import React from "react";
import { Outlet } from "react-router-dom";
import { EmployerHeader } from "./EmployerHeader";

const EmployerLayout = () => {
  return (
    <div className="vh-100">
      <EmployerHeader />
      <main className="flex-grow-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployerLayout;
