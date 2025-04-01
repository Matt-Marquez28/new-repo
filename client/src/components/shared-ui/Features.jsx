import React from "react";

const Features = () => {
  const interviewImageUrl =
    "https://img.freepik.com/free-photo/business-job-interview-concept_1421-77.jpg";
  const resumeImageUrl =
    "https://img.freepik.com/free-photo/close-up-hands-holding-cv_23-2149148569.jpg";
  const networkImageUrl =
    "https://img.freepik.com/free-photo/business-people-shaking-hands_53876-30568.jpg";

  return (
    <div className="container">
      <h2 className="text-center mb-5 display-5 fw-bold">Features</h2>
      <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-3">
        {/* Card 1 - Interview Preparation */}
        <div className="col">
          <div
            className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${interviewImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
              <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                Interview Preparation
              </h3>
              <div className="mb-4"></div>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto">
                  <img
                    src="https://github.com/twbs.png"
                    alt="Career"
                    width="32"
                    height="32"
                    className="rounded-circle border border-white"
                  />
                </li>
                <li className="d-flex align-items-center">
                  <small>Free resources</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 2 - Resume Builder */}
        <div className="col">
          <div
            className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${resumeImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
              <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                Resume Builder
              </h3>
              <div className="mb-4"></div>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto">
                  <img
                    src="https://github.com/twbs.png"
                    alt="Resume"
                    width="32"
                    height="32"
                    className="rounded-circle border border-white"
                  />
                </li>
                <li className="d-flex align-items-center">
                  <small>Easy export</small>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Card 3 - Networking Hub */}
        <div className="col">
          <div
            className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${networkImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
              <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                Job Matching
              </h3>
              <div className="mb-4"></div>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto">
                  <img
                    src="https://github.com/twbs.png"
                    alt="Network"
                    width="32"
                    height="32"
                    className="rounded-circle border border-white"
                  />
                </li>
                <li className="d-flex align-items-center">
                  <small>Grow your network</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
