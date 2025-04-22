import React from "react";
import CompanyStatisticsCard from "../admin-ui/CompanyStatisticsCard";
import ApplicantStatisticsCard from "../admin-ui/ApplicantStatisticsCard";
import LineChart from "../admin-ui/LineChart";
import Footer from "../shared-ui/Footer";
import CompanyRankings from "../admin-ui/CompanyRankings";
import AccountStatisticsCard from "../admin-ui/AccountStatisticsCard";
import CompanyRankingsTest from "../admin-ui/CompanyRankingsTest";
import ApplicationStatisticsCard from "../admin-ui/ApplicationStatistics";
const AdminDashboard = () => {
  return (
    <div className="container">
      <h4 className="text-primary">
        <i className="bi bi-speedometer"></i> Admin Dashboard
      </h4>
      <div className="row">
        {/* Accredited Companies Card */}

        {/* Total Applicants Card */}
        {/* <ApplicantStatisticsCard /> */}
        <ApplicationStatisticsCard />
        <CompanyStatisticsCard />
      </div>
      {/* Hired Applicants Card */}
      <AccountStatisticsCard />
      <LineChart />
      <CompanyRankings />
      {/* <CompanyRankingsTest/> */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
