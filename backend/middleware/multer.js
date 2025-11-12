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
export const createMulter = (folderName, allowedTypes, maxSizeMB) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "..", "uploads", folderName);
      fs.mkdirSync(uploadPath, { recursive: true }); // ensure folder exists
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed"), false);
  };

  return multer({ storage, fileFilter, limits: { fileSize: maxSizeMB * 1024 * 1024 } });
};
