import React from "react";
import Header from "../shared-ui/Header";
import Heroes from "../shared-ui/Heroes";
import Footer from "../shared-ui/Footer";
import Features from "../shared-ui/Features";
import ContactForm from "./ContactForm";

const LandingPage = () => {
  return (
    <div className="container">
      <Header />
      <Heroes />
      <Features/>
      <ContactForm/>
      <Footer />
    </div>
  );
};

export default LandingPage;
