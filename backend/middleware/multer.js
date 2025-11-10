import multer from "multer";
import path from "path";
import fs from "fs";

const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      console.log(`✅ Accepted file type: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.error(`❌ Invalid file type attempted: ${file.mimetype}`);
      cb(new Error(`❌ Invalid file type: ${file.mimetype}`), false);
    }
  };
};

{
  /* Function to create multer storage configuration */
}
export const createMulter = (foldername, allowedTypes = [], maxSizeMB = 5) => {
  const uploadPath = path.join("../uploads", foldername);

  // Ensure the upload directory exists
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

  const fileFilter = createFileFilter(allowedTypes);
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};
