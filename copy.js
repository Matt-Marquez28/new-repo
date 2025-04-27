<Card className="border-0 shadow-sm">
          <Card.Header
            className="text-white text-center"
            style={{
              backgroundColor: "#1a4798",
              // borderBottom: "3px solid #f0a500",
            }}
          >
            <div className="d-flex align-items-center justify-content-center">
              <i className="bi bi-person-badge-fill me-2"></i>
              <h5 className="m-0">Job Seeker Profile</h5>
            </div>
          </Card.Header>

          <Card.Body className="p-4">
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
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                          className="border rounded shadow-sm"
                        />
                      </div>
                    )}
                    {personalInformation?.firstName &&
                      personalInformation?.lastName && (
                        <h4 className="m-0" style={{ color: "#1a4798" }}>
                          {`${personalInformation.firstName} ${personalInformation.lastName}`}
                        </h4>
                      )}
                  </div>
                )}

                {/* Skills Sections */}
                <div className="bg-light p-3 rounded border mb-4">
                  {specializations?.length > 0 && (
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
                            className="badge bg-primary bg-opacity-10 text-primary"
                          >
                            {specialization}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {coreSkills?.length > 0 && (
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
                            className="badge bg-secondary bg-opacity-10 text-secondary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {softSkills?.length > 0 && (
                    <div className="mb-3">
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
                            className="badge bg-info bg-opacity-10 text-info"
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
                        <div className="bg-white p-2 rounded-2 border">
                          <i
                            className="bi bi-envelope-fill fs-5"
                            style={{ color: "#1a4798" }}
                          ></i>
                        </div>
                        <div>
                          <div className="fw-semibold small text-muted">
                            Email
                          </div>
                          <div className="text-dark">
                            {personalInformation.emailAddress}
                          </div>
                        </div>
                      </div>
                    )}

                    {personalInformation?.mobileNumber && (
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-white p-2 rounded-2 border">
                          <i
                            className="bi bi-phone-fill fs-5"
                            style={{ color: "#1a4798" }}
                          ></i>
                        </div>
                        <div>
                          <div className="fw-semibold small text-muted">
                            Mobile
                          </div>
                          <div className="text-dark">
                            {personalInformation.mobileNumber}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Education */}
                {educationalBackgrounds?.length > 0 && (
                  <div className="bg-light p-3 rounded-3 border">
                    <h5
                      className="d-flex align-items-center gap-2 mb-3"
                      style={{ color: "#1a4798" }}
                    >
                      <i className="bi bi-mortarboard-fill"></i>
                      Education
                    </h5>

                    <div className="position-relative ms-4">
                      {/* Vertical line */}
                      <div
                        className="position-absolute top-0 start-0 h-100"
                        style={{ width: "2px", backgroundColor: "#dee2e6" }}
                      ></div>

                      {educationalBackgrounds.map((education, index) => (
                        <div className="position-relative mb-4" key={index}>
                          {/* Dot */}
                          <div
                            className="position-absolute top-0 start-0 translate-middle rounded-circle"
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#1a4798",
                              border: "2px solid white",
                              boxShadow: "0 0 0 2px #1a4798",
                            }}
                          ></div>

                          <div className="ms-4 ps-3">
                            <div className="bg-white p-3 rounded-3 border">
                              <h6 className="mb-1 fw-bold">
                                {education?.degree_or_qualifications}
                              </h6>
                              <p className="text-muted small mb-2">
                                {new Date(
                                  education?.startDate
                                ).toLocaleDateString("default", {
                                  year: "numeric",
                                })}{" "}
                                • {education?.institutionName}
                              </p>

                              <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={() => toggleEducationDetails(index)}
                              >
                                <i
                                  className={`bi bi-${
                                    expandedEducation[index]
                                      ? "chevron-up"
                                      : "chevron-down"
                                  } me-1`}
                                ></i>
                                {expandedEducation[index]
                                  ? "Less Details"
                                  : "More Details"}
                              </button>

                              {expandedEducation[index] && (
                                <div className="mt-3">
                                  {education?.achievements?.length > 0 && (
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

                                  {education?.relevantCoursework?.length >
                                    0 && (
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

                                  {education?.certifications?.length > 0 && (
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

                                  {education?.proofOfEducationDocuments
                                    ?.length > 0 && (
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
                  <div className="bg-light p-4 rounded-3 border mb-4">
                    <h5
                      className="d-flex align-items-center gap-2 mb-3"
                      style={{ color: "#1a4798" }}
                    >
                      <i className="bi bi-person-lines-fill"></i>
                      Professional Summary
                    </h5>
                    <p className="text-dark" style={{ lineHeight: "1.8" }}>
                      {personalInformation.aboutMe}
                    </p>
                  </div>
                )}

                {/* Work Experience */}
                {workExperiences?.length > 0 && (
                  <div className="bg-light p-4 rounded-3 border">
                    <h5
                      className="d-flex align-items-center gap-2 mb-3"
                      style={{ color: "#1a4798" }}
                    >
                      <i className="bi bi-briefcase-fill"></i>
                      Work Experience
                    </h5>

                    <div className="position-relative ms-4">
                      {/* Vertical line */}
                      <div
                        className="position-absolute top-0 start-0 h-100"
                        style={{ width: "2px", backgroundColor: "#dee2e6" }}
                      ></div>

                      {workExperiences.map((work, index) => (
                        <div className="position-relative mb-4" key={index}>
                          {/* Dot */}
                          <div
                            className="position-absolute top-0 start-0 translate-middle rounded-circle"
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#1a4798",
                              border: "2px solid white",
                              boxShadow: "0 0 0 2px #1a4798",
                            }}
                          ></div>

                          <div className="ms-4 ps-3">
                            <div className="bg-white p-3 rounded-3 border">
                              <h6 className="mb-1 fw-bold">{work?.jobTitle}</h6>
                              <p className="text-muted small mb-2">
                                {new Date(work?.startDate).toLocaleDateString(
                                  "default",
                                  { year: "numeric" }
                                )}{" "}
                                • {work?.companyName}
                              </p>

                              <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={() =>
                                  toggleWorkExperienceDetails(index)
                                }
                              >
                                <i
                                  className={`bi bi-${
                                    expandedWorkExperience[index]
                                      ? "chevron-up"
                                      : "chevron-down"
                                  } me-1`}
                                ></i>
                                {expandedWorkExperience[index]
                                  ? "Less Details"
                                  : "More Details"}
                              </button>

                              {expandedWorkExperience[index] && (
                                <div className="mt-3">
                                  {work?.keyResponsibilities?.length > 0 && (
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

                                  {work?.achievements_and_contributions
                                    ?.length > 0 && (
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

                                  {work?.skills_and_tools_used?.length > 0 && (
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
                                              <span className="small">
                                                {skill}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {work?.proofOfWorkExperienceDocuments
                                    ?.length > 0 && (
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
              </div>
            </div>
          </Card.Body>
        </Card>

make the border a normal bootstrap border, also make the UI more cleaner, dont change the image its good now.