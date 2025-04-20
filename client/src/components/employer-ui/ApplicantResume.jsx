import React, { useState } from "react";
import default_profile from "../../images/default-profile.jpg";

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

  // Helper function to check if array exists and has items
  const hasContent = (array) => array && array.length > 0;

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
            {personalInformation?.photo && (
              <img
                src={personalInformation.photo || default_profile}
                alt="Profile Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
                className="border rounded shadow-sm"
              />
            )}
            {personalInformation?.firstName &&
              personalInformation?.lastName && (
                <h5 className="my-2 fw-bold" style={{ color: "#555555" }}>
                  {`${personalInformation.firstName} ${personalInformation.lastName}`}
                </h5>
              )}
          </div>

          <hr />

          {hasContent(specializations) && (
            <div className="mb-4">
              <h5 style={{ color: "#1a4798" }}>Specializations</h5>
              {specializations.map((specialization, index) => (
                <h6 key={index} className="text-secondary small fw-normal">
                  {specialization}
                </h6>
              ))}
            </div>
          )}

          {hasContent(coreSkills) && (
            <div className="mb-4">
              <h5 style={{ color: "#1a4798" }}>Core Skills</h5>
              {coreSkills.map((skill, index) => (
                <h6 key={index} className="text-secondary fw-normal small">
                  {skill}
                </h6>
              ))}
            </div>
          )}

          {hasContent(softSkills) && (
            <div className="mb-4">
              <h5 style={{ color: "#1a4798" }}>Soft Skills</h5>
              {softSkills.map((skill, index) => (
                <h6 key={index} className="text-secondary fw-normal small">
                  {skill}
                </h6>
              ))}
            </div>
          )}

          {(personalInformation?.emailAddress ||
            personalInformation?.mobileNumber) && (
            <div className="mb-2">
              <h5 style={{ color: "#1a4798" }}>Contact Information</h5>
              {personalInformation?.emailAddress && (
                <div className="d-flex text-start align-items-center gap-3 mb-3">
                  <div>
                    <i className="bi bi-envelope-fill fs-4 text-secondary"></i>
                  </div>
                  <div>
                    <div className="small fw-semibold text-secondary">
                      Email
                    </div>
                    <div className="text-secondary small">
                      {personalInformation.emailAddress}
                    </div>
                  </div>
                </div>
              )}
              {personalInformation?.mobileNumber && (
                <div className="d-flex text-start align-items-center gap-3 mb-3">
                  <div>
                    <i className="bi bi-phone-fill fs-4 text-secondary"></i>
                  </div>
                  <div>
                    <div className="small fw-semibold text-secondary">
                      Mobile No.
                    </div>
                    <div className="text-secondary small">
                      {personalInformation.mobileNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Educational Background */}
          {hasContent(educationalBackgrounds) && (
            <section className="py-2">
              <h5 className="mb-3" style={{ color: "#1a4798" }}>Educational Background</h5>
              <ul className="timeline">
                {educationalBackgrounds.map((education, index) => {
                  const hasEducationDetails =
                    hasContent(education?.achievements) ||
                    hasContent(education?.relevantCoursework) ||
                    hasContent(education?.certifications) ||
                    hasContent(education?.proofOfEducationDocuments);

                  return (
                    <li className="timeline-item mb-3" key={index}>
                      <h5 className="m-0 small">
                        {education?.degree_or_qualifications}
                      </h5>
                      <p className="text-secondary mb-2 m-0 small">
                        {education?.startDate &&
                          new Date(education.startDate).toLocaleDateString(
                            "default",
                            { year: "numeric" }
                          )}
                        {education?.institutionName &&
                          ` - ${education.institutionName}`}
                      </p>

                      {/* Only show toggle if there are details to show */}
                      {hasEducationDetails && (
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => toggleEducationDetails(index)}
                        >
                          {expandedEducation[index]
                            ? "Hide Details"
                            : "Show Details"}
                        </button>
                      )}

                      {/* Conditionally Rendered Details */}
                      {expandedEducation[index] && (
                        <>
                          {hasContent(education?.achievements) && (
                            <div className="my-3">
                              <h6 className="m-0 small">Achievements:</h6>
                              <ul className="list-unstyled">
                                {education.achievements.map(
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
                            </div>
                          )}

                          {hasContent(education?.relevantCoursework) && (
                            <div className="my-3">
                              <h6 className="m-0 small">
                                Relevant Course Work:
                              </h6>
                              <ul className="list-unstyled">
                                {education.relevantCoursework.map(
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
                            </div>
                          )}

                          {hasContent(education?.certifications) && (
                            <div className="my-3">
                              <h6 className="m-0 small">Certifications:</h6>
                              <ul className="list-unstyled">
                                {education.certifications.map(
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
                            </div>
                          )}

                          {hasContent(education?.proofOfEducationDocuments) && (
                            <div className="my-3">
                              <h6 className="m-0 small">Documents:</h6>
                              <ul className="list-unstyled">
                                {education.proofOfEducationDocuments.map(
                                  (doc, i) => (
                                    <li
                                      key={i}
                                      className="text-muted mx-3 small"
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
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
        <div className="col-md-8">
          {personalInformation?.aboutMe && (
            <div className="mb-4">
              <h5 style={{ color: "#1a4798" }}>About Me</h5>
              <p className="text-secondary text-justify small">
                {personalInformation.aboutMe}
              </p>
            </div>
          )}

          {/* Work Experiences */}
          {hasContent(workExperiences) && (
            <section className="py-2">
              <h5 className="mb-3" style={{ color: "#1a4798" }}>Work Experience</h5>
              <ul className="timeline">
                {workExperiences.map((work, index) => {
                  const hasWorkDetails =
                    hasContent(work?.keyResponsibilities) ||
                    hasContent(work?.achievements_and_contributions) ||
                    hasContent(work?.skills_and_tools_used) ||
                    hasContent(work?.proofOfWorkExperienceDocuments);

                  return (
                    <li className="timeline-item mb-3" key={index}>
                      <h5 className="m-0 small">{work?.jobTitle}</h5>
                      <p className="text-secondary mb-2 m-0 small">
                        {work?.startDate &&
                          new Date(work.startDate).toLocaleDateString(
                            "default",
                            {
                              year: "numeric",
                            }
                          )}
                        {work?.companyName && ` - ${work.companyName}`}
                      </p>

                      {/* Only show toggle if there are details to show */}
                      {hasWorkDetails && (
                        <button
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => toggleWorkExperienceDetails(index)}
                        >
                          {expandedWorkExperience[index]
                            ? "Hide Details"
                            : "Show Details"}
                        </button>
                      )}

                      {/* Conditionally Rendered Details */}
                      {expandedWorkExperience[index] && (
                        <>
                          {hasContent(work?.keyResponsibilities) && (
                            <div className="my-3">
                              <h6 className="m-0 small">
                                Key Responsibilities:
                              </h6>
                              <ul className="list-unstyled">
                                {work.keyResponsibilities.map(
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
                            </div>
                          )}

                          {hasContent(work?.achievements_and_contributions) && (
                            <div className="my-3">
                              <h6 className="m-0 small">
                                Achievements & Contributions:
                              </h6>
                              <ul className="list-unstyled">
                                {work.achievements_and_contributions.map(
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
                            </div>
                          )}

                          {hasContent(work?.skills_and_tools_used) && (
                            <div className="my-3">
                              <h6 className="m-0 small">
                                Skills & Tools Used:
                              </h6>
                              <ul className="list-unstyled">
                                {work.skills_and_tools_used.map((skills, i) => (
                                  <li
                                    key={i}
                                    className="text-secondary mx-3 small"
                                  >
                                    &#8226; {skills}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {hasContent(work?.proofOfWorkExperienceDocuments) && (
                            <div className="my-3">
                              <h6 className="m-0 small">Documents:</h6>
                              <ul className="list-unstyled">
                                {work.proofOfWorkExperienceDocuments.map(
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
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantResume;
