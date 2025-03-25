import React from "react";
import CompanyStatisticsCard from "../admin-ui/CompanyStatisticsCard";
import ApplicantStatisticsCard from "../admin-ui/ApplicantStatisticsCard";
import LineChart from "../admin-ui/LineChart";
import Footer from "../shared-ui/Footer";

const AdminDashboard = () => {
  return (
    <div className="container">
      <div className="row">
        {/* Accredited Companies Card */}
        <CompanyStatisticsCard />
        {/* Total Applicants Card */}
        <ApplicantStatisticsCard />
        {/* Hired Applicants Card */}
      </div>
      <LineChart />
      <Footer />
    </div>
  );
};

export default AdminDashboard;
