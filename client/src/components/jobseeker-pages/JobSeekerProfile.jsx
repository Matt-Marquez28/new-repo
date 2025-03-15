import React, { useState, useEffect } from "react";
import PersonalInformationForm from "../jobseeker-ui/PersonalInformationForm";
import Footer from "../shared-ui/Footer";
import { useNavigate } from "react-router-dom";
import WorkExperience from "../jobseeker-ui/WorkExperience";
import EducationalBackground from "../jobseeker-ui/EducationalBackground";
import JobPreferences from "../jobseeker-ui/JobPreferences";
import SkillsAndSpecializations from "../jobseeker-ui/SkillsAndSpecializations";
import CurriculumVitae from "../jobseeker-ui/CurriculumVitae";

const JobSeekerProfile = () => {
  const navigate = useNavigate();

  // Load active tab from localStorage or use default
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("jobSeekerProfileActiveTab");
    return savedTab || "personalInfo";
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jobSeekerProfileActiveTab", activeTab);
  }, [activeTab]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Automatically scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container">
      <div className="d-flex gap-2 my-2 align-items-center">
        <button onClick={() => navigate(-1)} className="btn btn-light">
          <i className="bi bi-arrow-90deg-left"></i>
        </button>
        <h5 className="my-2 text-primary">Job Seeker Profile</h5>
      </div>

      <div className="alert alert-primary" role="alert">
        <i className="bi bi-info-circle-fill"></i> Welcome to your profile
        setup! Complete each section to strengthen your job applications.
        Filling out your profile can help employers find you faster.
      </div>
      <div className="card shadow-sm">
        <div className="card-header">
          <ul className="nav nav-pills card-header-pills">
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "personalInfo" ? "active" : ""
                }`}
                onClick={() => handleTabClick("personalInfo")}
              >
                <i className="bi bi-file-person-fill"></i> Personal Info
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "skillsAndSpecializations" ? "active" : ""
                }`}
                onClick={() => handleTabClick("skillsAndSpecializations")}
              >
                <i className="bi bi-gear-wide-connected"></i> Skills &
                Specializations
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "educationalBackground" ? "active" : ""
                }`}
                onClick={() => handleTabClick("educationalBackground")}
              >
                <i className="bi bi-mortarboard-fill"></i> Educational
                Background
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "workExperience" ? "active" : ""
                }`}
                onClick={() => handleTabClick("workExperience")}
              >
                <i className="bi bi-suitcase-lg-fill"></i> Work Experience
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${
                  activeTab === "jobPreferences" ? "active" : ""
                }`}
                onClick={() => handleTabClick("jobPreferences")}
              >
                <i className="bi bi-sliders"></i> Job Preferences
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn ${activeTab === "cv" ? "active" : ""}`}
                onClick={() => handleTabClick("cv")}
              >
                <i className="bi bi-file-earmark-person-fill"></i> Curriculum
                Vitae
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === "personalInfo" && <PersonalInformationForm />}
          {activeTab === "skillsAndSpecializations" && (
            <SkillsAndSpecializations />
          )}
          {activeTab === "educationalBackground" && <EducationalBackground />}
          {activeTab === "workExperience" && <WorkExperience />}
          {activeTab === "jobPreferences" && <JobPreferences />}
          {activeTab === "cv" && <CurriculumVitae />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobSeekerProfile;
