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
import CompanyInformationForm from "../employer-ui/CompanyInformationForm";
import Footer from "../shared-ui/Footer";
import LegalDocuments from "../employer-ui/LegalDocuments";
import AboutUs from "../employer-ui/AboutUs";
import CandidatePreferences from "../employer-ui/CandidatePreferences";
import Accreditation from "../employer-ui/Accreditation";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("companyInformation");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Menu items configuration
  const menuItems = [
    {
      id: "companyInformation",
      label: "Company Info",
      icon: "bi-building-fill",
    },
    {
      id: "aboutUs",
      label: "About Us",
      icon: "bi-info-circle-fill",
    },
    {
      id: "candidatePreferences",
      label: "Candidate Preferences",
      icon: "bi-gear-fill",
    },
    {
      id: "legalDocuments",
      label: "Legal Documents",
      icon: "bi-file-earmark-check-fill",
    },
    {
      id: "accreditation",
      label: "Proof of Accreditation",
      icon: "bi-file-earmark-check-fill",
    },
  ];

  // Set initial tab from URL params or default
  useEffect(() => {
    const tabFromParams = searchParams.get("tab");
    if (tabFromParams && menuItems.some((item) => item.id === tabFromParams)) {
      setActiveTab(tabFromParams);
    } else {
      setActiveTab("companyInformation");
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
              Company Profile
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
            <Offcanvas.Title style={{ color: "#1a4798" }}>
              Company Profile
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Alert variant="primary" className="small m-3">
              <i className="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
              Complete each section to showcase your brand and job
              opportunities.
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
            <h5 className="my-0" style={{ color: "#1a4798" }}>
              Company Profile
            </h5>
            <Button variant="light" onClick={handleBack} aria-label="Go back">
              <i className="bi bi-arrow-left"></i>
            </Button>
          </div>
        )}

        <div className="flex-grow-1 overflow-auto">
          <Alert variant="primary" className="mb-3">
            <i className="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
            Complete each section to showcase your brand and job opportunities.
            A well-detailed profile can attract top talent and help job seekers
            learn more about your company.
          </Alert>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              {activeTab === "companyInformation" && <CompanyInformationForm />}
              {activeTab === "legalDocuments" && <LegalDocuments />}
              {activeTab === "aboutUs" && <AboutUs />}
              {activeTab === "candidatePreferences" && <CandidatePreferences />}
              {activeTab === "accreditation" && <Accreditation />}
            </Card.Body>
          </Card>
        </div>

        <Footer />
      </div>
    </Container>
  );
};

export default CompanyProfile;
