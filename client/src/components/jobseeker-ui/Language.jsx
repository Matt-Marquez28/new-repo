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

    // Check if language already exists
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

    // Check if it's a default language
    const isDefault = defaultLanguages.some(
      (lang) => lang.name === languageToDelete.name
    );

    if (isDefault) {
      // For default languages, just reset the checkboxes
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
      // For custom languages, remove them completely
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
        {
          withCredentials: true,
        }
      );

      console.log("Update successful:", res.data);
      triggerToast(res?.data?.message, "success");
    } catch (error) {
      console.error("Update failed:", error);
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

      // Merge default languages with saved languages
      const mergedLanguages = defaultLanguages.map((defaultLang) => {
        const savedLang = savedLanguages.find(
          (l) => l.name === defaultLang.name
        );
        return savedLang || defaultLang;
      });

      // Add any additional languages that aren't in the default list
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
      <div className="row align-items-center my-3">
        {/* Left side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>

        {/* Centered title */}
        <div className="col-auto">
          <h5 className="position-relative" style={{ color: "#1a4798" }}>
            <i className="bi bi-translate"></i> Language Proficiency
          </h5>
        </div>

        {/* Right side of the horizontal line */}
        <div className="col">
          <hr className="border-2" style={{ color: "#1a4798" }} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <table className="table table-bordered">
          <thead className="thead-light">
            <tr>
              <th className="fw-semibold">Language / Dialect</th>
              <th className="fw-semibold">Read</th>
              <th className="fw-semibold">Write</th>
              <th className="fw-semibold">Speak</th>
              <th className="fw-semibold">Understand</th>
              <th className="text-center fw-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language, index) => (
              <tr key={index}>
                <td>{language.name}</td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={language.read}
                    onChange={() => handleCheckboxChange(index, "read")}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={language.write}
                    onChange={() => handleCheckboxChange(index, "write")}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={language.speak}
                    onChange={() => handleCheckboxChange(index, "speak")}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={language.understand}
                    onChange={() => handleCheckboxChange(index, "understand")}
                  />
                </td>
                <td className="text-center">
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
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Other language: Specify"
                    value={otherLanguage}
                    onChange={(e) => setOtherLanguage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddOtherLanguage()
                    }
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-info"
                      onClick={handleAddOtherLanguage}
                    >
                      Add Language
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="d-flex justify-content-end mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
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
