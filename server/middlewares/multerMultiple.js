import multer from "multer";
import path from "path";

// Set up the storage engine to define where and how the files will be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the directory to store files
  },
  filename: (req, file, cb) => {
    // Use a timestamp to avoid file name conflicts
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Set up the file filter to restrict allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/; // Allowed file types
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!"),
      false
    );
  }
};

// Middleware for single file upload (e.g., for a resume)
// const uploadSingleFile = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB (optional)
//   fileFilter: fileFilter
// }).single("file"); // Handle single file for the "resume" field

// Middleware for multiple file uploads (e.g., proofOfEducationDocuments, otherFiles)
const uploadMultipleFiles = multer({
  storage: storage,
  // limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB (optional)
  fileFilter: fileFilter,
}).fields([
  // Handle multiple files for different fields
  { name: "proofOfEducationDocuments", maxCount: 10 }, // Multiple files for one field
  { name: "proofOfWorkExperienceDocuments", maxCount: 10 }, // Multiple files for another field

  // for job seeker
  { name: "validID1", maxCount: 1 }, // Valid ID 1
  { name: "validID2", maxCount: 1 }, // Valid ID 2

  // for employer
  { name: "dti", maxCount: 1 },
  { name: "mayorsPermit", maxCount: 1 },
  { name: "birRegistration", maxCount: 1 },
  { name: "secCertificate", maxCount: 1 },
  { name: "pagibigRegistration", maxCount: 1 },
  { name: "philhealthRegistration", maxCount: 1 },
  { name: "sss", maxCount: 1 },
]);

// Export both upload middlewares
export default uploadMultipleFiles;
