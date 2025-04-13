import React, { useState, useEffect } from "react";
import {
  Offcanvas,
  Container,
  Nav,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PersonalInformationForm from "../jobseeker-ui/PersonalInformationForm";
import Footer from "../shared-ui/Footer";
import WorkExperience from "../jobseeker-ui/WorkExperience";
import EducationalBackground from "../jobseeker-ui/EducationalBackground";
import JobPreferences from "../jobseeker-ui/JobPreferences";
import SkillsAndSpecializations from "../jobseeker-ui/SkillsAndSpecializations";
import CurriculumVitae from "../jobseeker-ui/CurriculumVitae";
import EmploymentStatus from "../jobseeker-ui/EmploymentStatus";
import Disability from "../jobseeker-ui/Disbility";
import Language from "../jobseeker-ui/Language";
import EligibilityProfessionalLicence from "../jobseeker-ui/Eligibility_ProfessionalLicence";

const JobSeekerProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("jobSeekerProfileActiveTab");
    return savedTab || "personalInfo";
  });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("jobSeekerProfileActiveTab", activeTab);
  }, [activeTab]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  const menuItems = [
    { id: "personalInfo", label: "Personal Info", icon: "bi-person-fill" },
    {
      id: "employmentStatus",
      label: "Employment Status",
      icon: "bi-briefcase-fill",
    },
    {
      id: "disability",
      label: "Disability",
      icon: "bi-universal-access-circle",
    },
    {
      id: "skillsAndSpecializations",
      label: "Skills & Specializations",
      icon: "bi-gear-wide-connected",
    },
    {
      id: "educationalBackground",
      label: "Educational Background",
      icon: "bi-mortarboard-fill",
    },
    {
      id: "workExperience",
      label: "Work Experience",
      icon: "bi-suitcase-lg-fill",
    },
    { id: "jobPreferences", label: "Job Preferences", icon: "bi-sliders" },
    { id: "language", label: "Language", icon: "bi-translate" },
    { id: "eligibility/licence", label: "Eligibility / Licence", icon: "bi-translate" },
    { id: "cv", label: "CV", icon: "bi-file-earmark-person-fill" },
  ];

  return (
    <Container fluid className="px-0 d-flex">
      {/* Desktop Sidebar (always visible on larger screens) */}
      {!isMobile && (
        <div
          className="d-flex flex-column flex-shrink-0 p-3 bg-light border"
          style={{ width: "280px", maxHeight: "100vh", minHeight: "100vh" }}
        >
          <div className="d-flex gap-2 mb-3 align-items-center">
            <Button variant="light" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </Button>
            <h5 className="my-0 text-primary">Job Seeker Profile</h5>
          </div>

          <hr />

          <Nav variant="pills" className="flex-column">
            {menuItems.map((item) => (
              <Nav.Item key={item.id}>
                <Nav.Link
                  active={activeTab === item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="d-flex align-items-center"
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {item.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>
      )}

      {/* Mobile Sidebar (Offcanvas) */}
      {isMobile && (
        <Offcanvas
          show={showMobileSidebar}
          onHide={() => setShowMobileSidebar(false)}
          responsive="md"
          placement="start"
          className="w-75"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Job Seeker Profile</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Alert variant="primary" className="small">
              <i className="bi bi-info-circle-fill me-2"></i>
              Complete each section to strengthen your job applications.
            </Alert>

            <hr />

            <Nav variant="pills" className="flex-column">
              {menuItems.map((item) => (
                <Nav.Item key={item.id}>
                  <Nav.Link
                    active={activeTab === item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="d-flex align-items-center"
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 p-3">
        {/* Mobile Header */}
        {isMobile && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="light" onClick={() => setShowMobileSidebar(true)}>
              <i className="bi bi-list"></i>
            </Button>
            <h5 className="my-0 text-primary">Job Seeker Profile</h5>
            <Button variant="light" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i>
            </Button>
          </div>
        )}

        <div className="overflow-auto" style={{ maxHeight: "85vh" }}>
          <Alert variant="primary">
            <i className="bi bi-info-circle-fill me-2"></i>
            Complete each section to strengthen your job applications.
          </Alert>
          <Card className="shadow-sm ">
            <Card.Body>
              {activeTab === "personalInfo" && <PersonalInformationForm />}
              {activeTab === "employmentStatus" && <EmploymentStatus />}
              {activeTab === "disability" && <Disability />}
              {activeTab === "skillsAndSpecializations" && (
                <SkillsAndSpecializations />
              )}
              {activeTab === "educationalBackground" && (
                <EducationalBackground />
              )}
              {activeTab === "workExperience" && <WorkExperience />}
              {activeTab === "jobPreferences" && <JobPreferences />}
              {activeTab === "language" && <Language />}
              {activeTab === "eligibility/licence" && <EligibilityProfessionalLicence />}
              {activeTab === "cv" && <CurriculumVitae />}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default JobSeekerProfile;
