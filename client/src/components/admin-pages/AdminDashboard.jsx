import React from "react";
import CompanyStatisticsCard from "../admin-ui/CompanyStatisticsCard";
import ApplicantStatisticsCard from "../admin-ui/ApplicantStatisticsCard";
import LineChart from "../admin-ui/LineChart";
import Footer from "../shared-ui/Footer";
import CompanyRankings from "../admin-ui/CompanyRankings";
import AccountStatisticsCard from "../admin-ui/AccountStatisticsCard";
import CompanyRankingsTest from "../admin-ui/CompanyRankingsTest";
import ApplicationStatisticsCard from "../admin-ui/ApplicationStatistics";
import { motion } from "framer-motion";
import CompanyStatistics from "../admin-ui/CompanyStatistics";
const AdminDashboard = () => {
  return (
    <div className="container">
      <div className="mb-3">
        <div className="d-flex align-items-center">
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#1a4798",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <i className="bi bi-speedometer text-white"></i>
          </div>
          <h4 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
            Admin Dashboard
          </h4>
        </div>
      </div>
      <div className="row">
        {/* Accredited Companies Card */}

        {/* Total Applicants Card */}
        {/* <ApplicantStatisticsCard /> */}
        <ApplicationStatisticsCard />
        {/* <CompanyStatisticsCard /> */}
        <CompanyStatistics />
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
