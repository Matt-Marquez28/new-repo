import React, { useState, useEffect, useCallback } from "react";
import {
  Offcanvas,
  Container,
  Nav,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("personalInfo");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Menu items configuration
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
    {
      id: "eligibilityLicence",
      label: "Eligibility / Licence",
      icon: "bi-award-fill",
    },
    { id: "cv", label: "CV", icon: "bi-file-earmark-person-fill" },
  ];

  // Set initial tab from URL params or default
  useEffect(() => {
    const tabFromParams = searchParams.get("tab");
    if (tabFromParams && menuItems.some((item) => item.id === tabFromParams)) {
      setActiveTab(tabFromParams);
    } else {
      setActiveTab("personalInfo");
    }
  }, [searchParams]);

  // Handle resize events with debounce
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
        // Close sidebar when resizing to desktop
        if (window.innerWidth >= 768) {
          setShowMobileSidebar(false);
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleTabClick = useCallback(
    (tabName) => {
      setActiveTab(tabName);
      // Update URL without page reload
      setSearchParams({ tab: tabName });
      if (isMobile) {
        setShowMobileSidebar(false);
      }
    },
    [isMobile, setSearchParams]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const toggleMobileSidebar = useCallback(() => {
    setShowMobileSidebar((prev) => !prev);
  }, []);

  return (
    <Container fluid className="px-0 d-flex min-vh-100">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className="d-flex flex-column flex-shrink-0 p-3 bg-light border-end"
          style={{ width: "280px" }}
        >
          <div className="d-flex gap-2 mb-3 align-items-center">
            <Button variant="light" onClick={handleBack} aria-label="Go back">
              <i className="bi bi-arrow-left"></i>
            </Button>
            <h5 className="my-0" style={{ color: "#1a4798" }}>
              Job Seeker Profile
            </h5>
          </div>

          <hr />

          <Nav variant="pills" className="flex-column">
            {menuItems.map((item) => (
              <Nav.Item key={item.id}>
                <Nav.Link
                  active={activeTab === item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="d-flex align-items-center"
                  eventKey={item.id}
                  aria-current={activeTab === item.id ? "page" : undefined}
                >
                  <i className={`bi ${item.icon} me-2`} aria-hidden="true"></i>
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
          onHide={toggleMobileSidebar}
          responsive="md"
          placement="start"
          className="w-75"
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title>Job Seeker Profile</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Alert variant="primary" className="small m-3">
              <i className="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
              Complete each section to strengthen your job applications.
            </Alert>

            <hr className="my-0" />

            <Nav variant="pills" className="flex-column">
              {menuItems.map((item) => (
                <Nav.Item key={item.id}>
                  <Nav.Link
                    active={activeTab === item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="d-flex align-items-center"
                    eventKey={item.id}
                  >
                    <i
                      className={`bi ${item.icon} me-2`}
                      aria-hidden="true"
                    ></i>
                    {item.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 p-3 d-flex flex-column">
        {/* Mobile Header */}
        {isMobile && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button
              variant="light"
              onClick={toggleMobileSidebar}
              aria-label="Open menu"
            >
              <i className="bi bi-list"></i>
            </Button>
            <h5 className="my-0 text-primary">Job Seeker Profile</h5>
            <Button variant="light" onClick={handleBack} aria-label="Go back">
              <i className="bi bi-arrow-left"></i>
            </Button>
          </div>
        )}

        <div className="flex-grow-1 overflow-auto">
          <Alert variant="primary" className="mb-3">
            <i className="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
            Complete each section to strengthen your job applications.
          </Alert>

          <Card className="shadow-sm mb-4">
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
              {activeTab === "eligibilityLicence" && (
                <EligibilityProfessionalLicence />
              )}
              {activeTab === "cv" && <CurriculumVitae />}
            </Card.Body>
          </Card>
        </div>

        <Footer />
      </div>
    </Container>
  );
};

export default JobSeekerProfile;
