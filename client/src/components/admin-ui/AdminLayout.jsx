import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <AdminHeader />

      <div className="d-flex flex-grow-1 overflow-auto">
        {/* Sidebar */}
        {isSidebarOpen && <AdminSidebar />}

        {/* Main content */}
        <main className="flex-grow-1 overflow-auto p-3">
          {/* Routed content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
