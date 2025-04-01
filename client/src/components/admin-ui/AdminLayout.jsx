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
      <AdminHeader toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on md+ */}
        {isSidebarOpen && (
          <div className="d-none d-md-flex h-100" style={{ minWidth: "250px" }}>
            <AdminSidebar />
          </div>
        )}

        {/* Main content - always visible */}
        <main className="flex-grow-1 overflow-auto p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
