import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024; // 100MB default
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, "../../uploads");

const createDirectories = () => {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const dirs = [
    UPLOAD_PATH,
    path.join(UPLOAD_PATH, "profile"),
    path.join(UPLOAD_PATH, "documents"),
    path.join(UPLOAD_PATH, "temp"),
    path.join(UPLOAD_PATH, "profile", year),
    path.join(UPLOAD_PATH, "documents", year),
    path.join(UPLOAD_PATH, "profile", year, month),
    path.join(UPLOAD_PATH, "documents", year, month),
    path.join(UPLOAD_PATH, "products", year, month)
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

const generateSecureFilename = (originalname) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalname).toLowerCase();
  const hash = crypto.createHash("md5").update(originalname + timestamp).digest("hex").substring(0, 8);
  return `${hash}-${timestamp}-${random}${ext}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const folder = file.fieldname === "profileImage" ? "profile" : "documents";
    const dest = path.join(UPLOAD_PATH, folder, year, month);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, generateSecureFilename(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

export default upload;
