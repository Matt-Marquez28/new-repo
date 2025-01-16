import React from "react";
import Header from "../shared-ui/Header";
import Heroes from "../shared-ui/Heroes";
import Footer from "../shared-ui/Footer";

const LandingPage = () => {
  return (
    <div className="container">
      <Header />
      <Heroes />
      <Footer />
    </div>
  );
};

export default LandingPage;
