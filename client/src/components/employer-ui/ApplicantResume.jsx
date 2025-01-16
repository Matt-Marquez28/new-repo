import React, { useState } from "react";

const ApplicantResume = ({ jobseekerData }) => {
  // Separate state for educational background and work experiences
  const [expandedEducation, setExpandedEducation] = useState({});
  const [expandedWorkExperience, setExpandedWorkExperience] = useState({});

  const personalInformation = jobseekerData?.personalInformation;
  const specializations =
    jobseekerData?.skillsAndSpecializations?.specializations;
  const coreSkills = jobseekerData?.skillsAndSpecializations?.coreSkills;
  const softSkills = jobseekerData?.skillsAndSpecializations?.softSkills;
  const educationalBackgrounds = jobseekerData?.educationalBackground;
  const workExperiences = jobseekerData?.workExperience;

  // Separate toggle functions for each section
  const toggleEducationDetails = (index) => {
    setExpandedEducation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleWorkExperienceDetails = (index) => {
    setExpandedWorkExperience((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div>
      <div className="overflow-auto row" style={{ maxHeight: "700px" }}>
        <div className="col-md-4">
          <div className="mb-4 text-center">
            <img
              src={personalInformation?.photo}
              alt="Profile Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
              }}
              className="border rounded shadow-sm"
            />
            <h5
              className="my-2 fw-bold"
              style={{ color: "#555555" }}
            >{`${personalInformation?.firstName} ${personalInformation?.lastName}`}</h5>
          </div>

          <hr />

          <div className="mb-4">
            <h5 className="text-primary">Specializations</h5>
            {specializations?.map((specialization, index) => (
              <h6 key={index} className="text-secondary small fw-normal">
                {specialization}
              </h6>
            ))}
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Core Skills</h5>
            {coreSkills?.map((skill, index) => (
              <h6 key={index} className="text-secondary fw-normal small">
                {/* <span className="badge bg-light text-secondary">{skill}</span> */}
                {skill}
              </h6>
            ))}
          </div>

          <div className="mb-4">
            <h5 className="text-primary">Soft Skills</h5>
            {softSkills?.map((skill, index) => (
              <h6 key={index} className="text-secondary fw-normal small">
                {skill}
              </h6>
            ))}
          </div>

          <div className="mb-2">
            <h5 className="text-primary">Contact Information</h5>
            <div className="d-flex text-start align-items-center gap-3 mb-3">
              <div>
                <i className="bi bi-envelope-fill fs-4 text-secondary"></i>
              </div>
              <div>
                <div className="small fw-semibold text-secondary">Email</div>
                <div className="text-secondary small">
                  {personalInformation?.emailAddress}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex text-start align-items-center gap-3 mb-3">
            <div>
              <i className="bi bi-phone-fill fs-4 text-secondary"></i>
            </div>
            <div>
              <div className="small fw-semibold text-secondary">Mobile No.</div>
              <div className="text-secondary small">
                {personalInformation?.mobileNumber}
              </div>
            </div>
          </div>
          {/* Educational Background */}
          <section className="py-2">
            <h5 className="text-primary mb-3">Educational Background</h5>
            <ul className="timeline">
              {educationalBackgrounds?.map((education, index) => (
                <li className="timeline-item mb-3" key={index}>
                  <h5 className="m-0 small">
                    {education?.degree_or_qualifications}
                  </h5>
                  <p className="text-secondary mb-2 m-0 small">
                    {new Date(education?.startDate).toLocaleDateString(
                      "default",
                      { year: "numeric" }
                    )}{" "}
                    - {education?.institutionName}
                  </p>

                  {/* Details Toggle Button */}
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => toggleEducationDetails(index)}
                  >
                    {expandedEducation[index] ? "Hide Details" : "Show Details"}
                  </button>

                  {/* Conditionally Rendered Details */}
                  {expandedEducation[index] && (
                    <>
                      <div className="my-3">
                        <h6 className="m-0 small">Achievements:</h6>
                        {education?.achievements &&
                          education?.achievements.length > 0 && (
                            <ul className="list-unstyled">
                              {education?.achievements.map((achievement, i) => (
                                <li
                                  key={i}
                                  className="text-secondary mx-3 small"
                                >
                                  &#8226; {achievement}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0 small">Relevant Course Work:</h6>
                        {education?.relevantCoursework &&
                          education?.relevantCoursework.length > 0 && (
                            <ul className="list-unstyled">
                              {education?.relevantCoursework.map(
                                (coursework, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226; {coursework}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0csmall">Certifications:</h6>
                        {education?.certifications &&
                          education?.certifications.length > 0 && (
                            <ul className="list-unstyled">
                              {education?.certifications.map(
                                (certification, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226; {certification}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0 small">Documents:</h6>
                        {education?.proofOfEducationDocuments &&
                          education?.proofOfEducationDocuments.length > 0 && (
                            <ul className="list-unstyled">
                              {education?.proofOfEducationDocuments.map(
                                (doc, i) => (
                                  <li key={i} className="text-muted mx-3 small">
                                    &#8226;
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
                                      {" "}
                                      {doc.originalName}
                                    </a>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="col-md-8">
          <div className="mb-4">
            <h5 className="text-primary">About Me</h5>
            <p className="text-secondary text-justify small">
              {personalInformation?.aboutMe}
            </p>
          </div>

          {/* Work Experiences */}
          <section className="py-2">
            <h5 className="text-primary mb-3">Work Experience</h5>
            <ul className="timeline">
              {workExperiences?.map((work, index) => (
                <li className="timeline-item mb-3" key={index}>
                  <h5 className="m-0 small">{work?.jobTitle}</h5>
                  <p className="text-secondary mb-2 m-0 small">
                    {new Date(work?.startDate).toLocaleDateString("default", {
                      year: "numeric",
                    })}{" "}
                    - {work?.companyName}
                  </p>

                  {/* Details Toggle Button */}
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => toggleWorkExperienceDetails(index)}
                  >
                    {expandedWorkExperience[index]
                      ? "Hide Details"
                      : "Show Details"}
                  </button>

                  {/* Conditionally Rendered Details */}
                  {expandedWorkExperience[index] && (
                    <>
                      <div className="my-3">
                        <h6 className="m-0 small">Key Responsibilities:</h6>
                        {work?.keyResponsibilities &&
                          work?.keyResponsibilities.length > 0 && (
                            <ul className="list-unstyled">
                              {work?.keyResponsibilities.map(
                                (responsibility, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226; {responsibility}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0 small">
                          Achievements & Contributions:
                        </h6>
                        {work?.achievements_and_contributions &&
                          work?.achievements_and_contributions.length > 0 && (
                            <ul className="list-unstyled">
                              {work?.achievements_and_contributions.map(
                                (achievement, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226; {achievement}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0 small">Skills & Tools Used:</h6>
                        {work?.skills_and_tools_used &&
                          work?.skills_and_tools_used.length > 0 && (
                            <ul className="list-unstyled">
                              {work?.skills_and_tools_used.map((skills, i) => (
                                <li
                                  key={i}
                                  className="text-secondary mx-3 small"
                                >
                                  &#8226; {skills}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>

                      <div className="my-3">
                        <h6 className="m-0 small">Documents:</h6>
                        {work?.proofOfWorkExperienceDocuments &&
                          work?.proofOfWorkExperienceDocuments.length > 0 && (
                            <ul className="list-unstyled">
                              {work?.proofOfWorkExperienceDocuments.map(
                                (doc, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226;
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
                                      {" "}
                                      {doc.originalName}
                                    </a>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicantResume;
