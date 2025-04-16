import React from "react";

const Features = () => {
  const interviewImageUrl =
    "https://img.freepik.com/free-photo/business-job-interview-concept_1421-77.jpg";
  const resumeImageUrl =
    "https://img.freepik.com/free-photo/close-up-hands-holding-cv_23-2149148569.jpg";
  const networkImageUrl =
    "https://img.freepik.com/free-photo/business-people-shaking-hands_53876-30568.jpg";

  return (
    <div className="container my-5">
      <h2 className="text-center mb-5 display-5 fw-bold" style={{ color: "#1a4798" }}>Features</h2>
      <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-3">
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
              <p className="mb-4">
                Connect with opportunities that match your career goals. Our
                algorithm finds the perfect fit for your next career move.
              </p>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s"
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

        {/* Card 2 - Resume Builder */}
        <div className="col">
          <div
            className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://img.freepik.com/free-photo/closeup-candidate-giving-his-cv-while-applying-job-office_637285-6571.jpg?t=st=1743948988~exp=1743952588~hmac=6d8ff6367b539e88bcd63f59c1ec7ad0f6876e56b8e766ab52160402930c7118&w=1380")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
              <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                Resume Builder
              </h3>
              <p className="mb-4">
                Showcase your professional journey by highlighting key skills,
                education, and work experience.
              </p>
              <div className="mb-4"></div>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s"
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
              <h3 className="pt-5 mt-5 mb-3 display-6 lh-1 fw-bold opacity-90">
                Application Tracker
              </h3>
              <p className="mb-4 opacity-80">
                Organize and monitor all your job applications in one place.
                Track application statuses, and interview
                schedules to stay on top of your job search.
              </p>
              <ul className="d-flex list-unstyled mt-auto">
                <li className="me-auto opacity-90">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJOeEApKV3HZv0HZLbBXvhOB0icqfJk5qfdw&s"
                    alt="Career"
                    width="32"
                    height="32"
                    className="rounded-circle border border-white"
                  />
                </li>
                <li className="d-flex align-items-center opacity-80">
                  <small>Free resources</small>
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
