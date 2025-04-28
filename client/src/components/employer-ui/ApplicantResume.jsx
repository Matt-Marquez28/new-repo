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
  const languages = jobseekerData?.languages;
  const trainings = jobseekerData?.trainings;

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
    <div className="p-4">
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-md-4">
          {/* Profile Section */}
          {(personalInformation?.photo ||
            (personalInformation?.firstName &&
              personalInformation?.lastName)) && (
            <div className="mb-4 text-center p-3 bg-light rounded border">
              {personalInformation?.photo && (
                <div className="mb-3">
                  <img
                    src={personalInformation.photo || default_profile}
                    alt="Profile"
                    className="border rounded shadow-sm"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              {personalInformation?.firstName &&
                personalInformation?.lastName && (
                  <h5 className="m-0" style={{ color: "#1a4798" }}>
                    {`${personalInformation.firstName} ${personalInformation.lastName}`}
                  </h5>
                )}
            </div>
          )}

          {/* Skills Sections */}
          <div className="bg-light p-3 rounded border mb-4">
            {hasContent(specializations) && (
              <div className="mb-4">
                <h5
                  className="d-flex align-items-center gap-2"
                  style={{ color: "#1a4798" }}
                >
                  <i className="bi bi-award-fill"></i>
                  Specializations
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {specializations.map((specialization, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        backgroundColor: "rgba(26, 71, 152, 0.1)",
                        color: "#1a4798",
                      }}
                    >
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasContent(coreSkills) && (
              <div className="mb-4">
                <h5
                  className="d-flex align-items-center gap-2"
                  style={{ color: "#1a4798" }}
                >
                  <i className="bi bi-tools"></i>
                  Core Skills
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {coreSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        backgroundColor: "rgba(26, 71, 152, 0.1)",
                        color: "#1a4798",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasContent(softSkills) && (
              <div>
                <h5
                  className="d-flex align-items-center gap-2"
                  style={{ color: "#1a4798" }}
                >
                  <i className="bi bi-people-fill"></i>
                  Soft Skills
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        backgroundColor: "rgba(26, 71, 152, 0.1)",
                        color: "#1a4798",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {(personalInformation?.emailAddress ||
            personalInformation?.mobileNumber) && (
            <div className="bg-light p-3 rounded border mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-envelope-at-fill"></i>
                Contact Information
              </h5>

              {personalInformation?.emailAddress && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-white p-2 rounded border">
                    <i
                      className="bi bi-envelope-fill fs-5"
                      style={{ color: "#1a4798" }}
                    ></i>
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">Email</div>
                    <div className="small">
                      {personalInformation.emailAddress}
                    </div>
                  </div>
                </div>
              )}

              {personalInformation?.mobileNumber && (
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white p-2 rounded border">
                    <i
                      className="bi bi-phone-fill fs-5"
                      style={{ color: "#1a4798" }}
                    ></i>
                  </div>
                  <div>
                    <div className="fw-semibold small text-muted">Mobile</div>
                    <div className="small">
                      {personalInformation.mobileNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language Proficiency */}
          {languages?.filter(
            (lang) => lang.read || lang.write || lang.speak || lang.understand
          ).length > 0 && (
            <div className="bg-light p-3 rounded border mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-translate"></i>
                Languages
              </h5>

              <div className="d-flex flex-wrap gap-2">
                {languages
                  .filter(
                    (lang) =>
                      lang.read || lang.write || lang.speak || lang.understand
                  )
                  .map((language, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        backgroundColor: "rgba(26, 71, 152, 0.1)",
                        color: "#1a4798",
                      }}
                    >
                      {language.name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Education */}
          {hasContent(educationalBackgrounds) && (
            <div className="bg-light p-3 rounded border">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-mortarboard-fill"></i>
                Education
              </h5>

              <div className="position-relative">
                <div
                  className="position-absolute top-0 start-0 h-100"
                  style={{
                    width: "2px",
                    backgroundColor: "#1a4798",
                    marginLeft: "5px",
                  }}
                ></div>
                {educationalBackgrounds.map((education, index) => (
                  <div className="position-relative mb-4" key={index}>
                    <div
                      className="position-absolute top-0 start-0 translate-middle rounded-circle"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#1a4798",
                        border: "2px solid white",
                        boxShadow: "0 0 0 1px #1a4798",
                        marginLeft: "5px",
                      }}
                    ></div>

                    <div className="ms-4 ps-2">
                      <div className="bg-white p-3 rounded border">
                        <h6 className="mb-1 fw-bold">
                          {education?.degree_or_qualifications}
                        </h6>
                        <p className="text-muted small mb-2">
                          {education?.startDate &&
                            new Date(education.startDate).toLocaleDateString(
                              "default",
                              {
                                year: "numeric",
                              }
                            )}{" "}
                          • {education?.institutionName}
                        </p>

                        {(hasContent(education?.achievements) ||
                          hasContent(education?.relevantCoursework) ||
                          hasContent(education?.certifications) ||
                          hasContent(education?.proofOfEducationDocuments)) && (
                          <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => toggleEducationDetails(index)}
                            style={{
                              borderColor: "#1a4798",
                              color: "#1a4798",
                            }}
                          >
                            <i
                              className={`bi bi-chevron-${
                                expandedEducation[index] ? "up" : "down"
                              } me-1`}
                            ></i>
                            {expandedEducation[index]
                              ? "Less Details"
                              : "More Details"}
                          </button>
                        )}

                        {expandedEducation[index] && (
                          <div className="mt-3">
                            {hasContent(education?.achievements) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-trophy-fill text-warning"></i>
                                  Achievements
                                </h6>
                                <ul className="list-unstyled">
                                  {education.achievements.map(
                                    (achievement, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">
                                          {achievement}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(education?.relevantCoursework) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-journal-bookmark-fill text-primary"></i>
                                  Relevant Coursework
                                </h6>
                                <ul className="list-unstyled">
                                  {education.relevantCoursework.map(
                                    (coursework, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">
                                          {coursework}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(education?.certifications) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-file-earmark-check-fill text-success"></i>
                                  Certifications
                                </h6>
                                <ul className="list-unstyled">
                                  {education.certifications.map(
                                    (certification, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">
                                          {certification}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(
                              education?.proofOfEducationDocuments
                            ) && (
                              <div>
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-file-earmark-arrow-down-fill text-info"></i>
                                  Documents
                                </h6>
                                <ul className="list-unstyled">
                                  {education.proofOfEducationDocuments.map(
                                    (doc, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <a
                                          href={doc.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="small text-decoration-none"
                                        >
                                          {doc.originalName}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-md-8">
          {/* About Me */}
          {personalInformation?.aboutMe && (
            <div className="bg-light p-4 rounded border mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-person-lines-fill"></i>
                Professional Summary
              </h5>
              <p className="mb-0 text-secondary small">
                {personalInformation.aboutMe}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {hasContent(workExperiences) && (
            <div className="bg-light p-4 rounded border mb-4">
              <h5
                className="d-flex align-items-center gap-2 mb-3"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-briefcase-fill"></i>
                Work Experience
              </h5>

              <div className="position-relative">
                <div
                  className="position-absolute top-0 start-0 h-100"
                  style={{
                    width: "2px",
                    backgroundColor: "#1a4798",
                    marginLeft: "5px",
                  }}
                ></div>
                {workExperiences.map((work, index) => (
                  <div className="position-relative mb-4" key={index}>
                    <div
                      className="position-absolute top-0 start-0 translate-middle rounded-circle"
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#1a4798",
                        border: "2px solid white",
                        boxShadow: "0 0 0 1px #1a4798",
                        marginLeft: "5px",
                      }}
                    ></div>

                    <div className="ms-4 ps-2">
                      <div className="bg-white p-3 rounded border">
                        <h6 className="mb-1 fw-bold">{work?.jobTitle}</h6>
                        <p className="text-muted small mb-2">
                          {work?.startDate &&
                            new Date(work.startDate).toLocaleDateString(
                              "default",
                              {
                                year: "numeric",
                              }
                            )}{" "}
                          • {work?.companyName}
                        </p>

                        {hasContent(work?.keyResponsibilities) ||
                        hasContent(work?.achievements_and_contributions) ||
                        hasContent(work?.skills_and_tools_used) ||
                        hasContent(work?.proofOfWorkExperienceDocuments) ? (
                          <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => toggleWorkExperienceDetails(index)}
                            style={{
                              borderColor: "#1a4798",
                              color: "#1a4798",
                            }}
                          >
                            <i
                              className={`bi bi-chevron-${
                                expandedWorkExperience[index] ? "up" : "down"
                              } me-1`}
                            ></i>
                            {expandedWorkExperience[index]
                              ? "Less Details"
                              : "More Details"}
                          </button>
                        ) : null}

                        {expandedWorkExperience[index] && (
                          <div className="mt-3">
                            {hasContent(work?.keyResponsibilities) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-list-check text-primary"></i>
                                  Key Responsibilities
                                </h6>
                                <ul className="list-unstyled">
                                  {work.keyResponsibilities.map(
                                    (responsibility, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">
                                          {responsibility}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(
                              work?.achievements_and_contributions
                            ) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-trophy-fill text-warning"></i>
                                  Achievements & Contributions
                                </h6>
                                <ul className="list-unstyled">
                                  {work.achievements_and_contributions.map(
                                    (achievement, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">
                                          {achievement}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(work?.skills_and_tools_used) && (
                              <div className="mb-3">
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-tools text-info"></i>
                                  Skills & Tools Used
                                </h6>
                                <ul className="list-unstyled">
                                  {work.skills_and_tools_used.map(
                                    (skill, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <span className="small">{skill}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {hasContent(
                              work?.proofOfWorkExperienceDocuments
                            ) && (
                              <div>
                                <h6 className="small fw-semibold d-flex align-items-center gap-2">
                                  <i className="bi bi-file-earmark-arrow-down-fill text-secondary"></i>
                                  Documents
                                </h6>
                                <ul className="list-unstyled">
                                  {work.proofOfWorkExperienceDocuments.map(
                                    (doc, i) => (
                                      <li key={i} className="d-flex mb-2">
                                        <span className="me-2">•</span>
                                        <a
                                          href={doc.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="small text-decoration-none"
                                        >
                                          {doc.originalName}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trainings Section - Added new section */}
          {trainings?.length > 0 && (
            <div className="bg-light p-3 rounded border mb-4">
              <h5
                className="d-flex align-items-center gap-2"
                style={{ color: "#1a4798" }}
              >
                <i className="bi bi-award"></i>
                Trainings & Certifications
              </h5>
              <div className="mt-3">
                {trainings.map((training, index) => (
                  <div key={index} className="mb-3 pb-2 border-bottom">
                    <h6 className="fw-bold mb-1">{training.trainingName}</h6>
                    <div className="small text-muted mb-1">
                      {training.institution && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-building"></i>
                          {training.institution}
                        </div>
                      )}
                      {training.hours && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-clock"></i>
                          {training.hours} hours
                        </div>
                      )}
                    </div>
                    {training.skills?.length > 0 && (
                      <div className="mt-2">
                        <div className="d-flex flex-wrap gap-2">
                          {training.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="badge"
                              style={{
                                backgroundColor: "rgba(26, 71, 152, 0.1)",
                                color: "#1a4798",
                                fontSize: "0.75rem",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {training.certificate && (
                      <div className="mt-2">
                        <div className="d-flex align-items-start gap-2">
                          <i
                            className="bi bi-file-earmark-text mt-1"
                            style={{ color: "#1a4798" }}
                          ></i>
                          <div>
                            <div className="fw-semibold small">
                              Certificate:
                            </div>
                            <div className="text-muted small">
                              {training.certificate}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantResume;
