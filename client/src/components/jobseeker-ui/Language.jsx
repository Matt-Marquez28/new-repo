import React, { useState, useEffect } from "react";
import axios from "axios";
import { JOBSEEKER_API_END_POINT } from "../../utils/constants";
import { useToast } from "../../contexts/toast.context";

const Language = () => {
  const triggerToast = useToast();
  const defaultLanguages = [
    {
      name: "Filipino",
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
    {
      name: "English",
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
    {
      name: "Mandarin",
      read: false,
      write: false,
      speak: false,
      understand: false,
    },
  ];

  const [languages, setLanguages] = useState([...defaultLanguages]);
  const [otherLanguage, setOtherLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (index, field) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index][field] = !updatedLanguages[index][field];
    setLanguages(updatedLanguages);
  };

  const handleAddOtherLanguage = () => {
    if (otherLanguage.trim() === "") {
      triggerToast("Please enter a language name", "error");
      return;
    }

    if (
      languages.some(
        (lang) => lang.name.toLowerCase() === otherLanguage.toLowerCase()
      )
    ) {
      triggerToast("This language already exists", "error");
      return;
    }

    setLanguages([
      ...languages,
      {
        name: otherLanguage.trim(),
        read: false,
        write: false,
        speak: false,
        understand: false,
      },
    ]);
    setOtherLanguage("");
  };

  const handleDeleteLanguage = (index) => {
    const languageToDelete = languages[index];
    const isDefault = defaultLanguages.some(
      (lang) => lang.name === languageToDelete.name
    );

    if (isDefault) {
      const updatedLanguages = [...languages];
      updatedLanguages[index] = {
        ...updatedLanguages[index],
        read: false,
        write: false,
        speak: false,
        understand: false,
      };
      setLanguages(updatedLanguages);
      triggerToast("Default language proficiency reset", "info");
    } else {
      const updatedLanguages = languages.filter((_, i) => i !== index);
      setLanguages(updatedLanguages);
      triggerToast("Language removed", "success");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.put(
        `${JOBSEEKER_API_END_POINT}/update-languages`,
        { languages },
        { withCredentials: true }
      );
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      triggerToast(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getJobSeekerData();
  }, []);

  const getJobSeekerData = async () => {
    try {
      const res = await axios.get(
        `${JOBSEEKER_API_END_POINT}/get-jobseeker-data`,
        { withCredentials: true }
      );

      const savedLanguages = res?.data?.jobSeekerData?.languages || [];
      const mergedLanguages = defaultLanguages.map((defaultLang) => {
        const savedLang = savedLanguages.find(
          (l) => l.name === defaultLang.name
        );
        return savedLang || defaultLang;
      });

      const additionalLanguages = savedLanguages.filter(
        (savedLang) =>
          !defaultLanguages.some(
            (defaultLang) => defaultLang.name === savedLang.name
          )
      );

      setLanguages([...mergedLanguages, ...additionalLanguages]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-3">
        <div className="d-flex align-items-center">
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#1a4798",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
            }}
          >
            <i className="bi bi-translate text-white"></i>
          </div>
          <h5 className="m-0 fw-semibold" style={{ color: "#1a4798" }}>
            Language Proficiency
          </h5>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {languages.map((language, index) => (
            <div key={index} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-semibold">{language.name}</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteLanguage(index)}
                    title={
                      defaultLanguages.some(
                        (lang) => lang.name === language.name
                      )
                        ? "Reset proficiency"
                        : "Remove language"
                    }
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`read-${index}`}
                        checked={language.read}
                        onChange={() => handleCheckboxChange(index, "read")}
                      />
                      <label className="form-check-label" htmlFor={`read-${index}`}>
                        Read
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`write-${index}`}
                        checked={language.write}
                        onChange={() => handleCheckboxChange(index, "write")}
                      />
                      <label className="form-check-label" htmlFor={`write-${index}`}>
                        Write
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`speak-${index}`}
                        checked={language.speak}
                        onChange={() => handleCheckboxChange(index, "speak")}
                      />
                      <label className="form-check-label" htmlFor={`speak-${index}`}>
                        Speak
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`understand-${index}`}
                        checked={language.understand}
                        onChange={() => handleCheckboxChange(index, "understand")}
                      />
                      <label className="form-check-label" htmlFor={`understand-${index}`}>
                        Understand
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title mb-3">Add New Language</h6>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter language name"
                value={otherLanguage}
                onChange={(e) => setOtherLanguage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOtherLanguage()}
              />
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={handleAddOtherLanguage}
              >
                Add Language
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button
            type="submit"
            className="btn text-white"
            style={{ backgroundColor: "#1a4798" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  style={{ backgroundColor: "#1a4798" }}
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-floppy me-2"></i> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Language;