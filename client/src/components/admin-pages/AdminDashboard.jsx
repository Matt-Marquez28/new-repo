import React from "react";
import CompanyStatisticsCard from "../admin-ui/CompanyStatisticsCard";
import ApplicantStatisticsCard from "../admin-ui/ApplicantStatisticsCard";
import LineChart from "../admin-ui/LineChart";
import Footer from "../shared-ui/Footer";
import CompanyRankings from "../admin-ui/CompanyRankings";

const AdminDashboard = () => {
  return (
    <div className="container">
      <h5 className="text-primary"><i className="bi bi-speedometer"></i> Admin Dashboard</h5>
      <div className="row">
        {/* Accredited Companies Card */}
        <CompanyStatisticsCard />
        {/* Total Applicants Card */}
        <ApplicantStatisticsCard />
        {/* Hired Applicants Card */}
      </div>
      <LineChart />
      <CompanyRankings />
      <Footer />
    </div>
  );
};

export default AdminDashboard;
