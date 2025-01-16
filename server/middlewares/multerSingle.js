import multer from "multer";

// Set up memory storage
const storage = multer.memoryStorage();

// Handle single file upload
export const singleUpload = multer({ storage }).single("file");