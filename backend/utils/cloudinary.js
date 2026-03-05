import path from "path";
import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_PREFIX = "cld__";

// Apply explicit optimization before storing images in Cloudinary.
const DEFAULT_IMAGE_UPLOAD_TRANSFORMATION = [
  {
    width: 1920,
    height: 1920,
    crop: "limit",
    fetch_format: "auto",
    quality: "auto:good",
    flags: "progressive",
  },
];

// Forum images are typically viewed in feed/cards, so use a smaller cap and stronger compression.
const FORUM_IMAGE_UPLOAD_TRANSFORMATION = [
  {
    width: 1280,
    height: 1280,
    crop: "limit",
    fetch_format: "auto",
    quality: "auto:eco",
    flags: "progressive",
  },
];

const getUploadTransformationForScope = (scope) => {
  if (scope === "forum") return FORUM_IMAGE_UPLOAD_TRANSFORMATION;
  return DEFAULT_IMAGE_UPLOAD_TRANSFORMATION;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
};

const ensureCloudinaryConfigured = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured.");
  }
};

const sanitizePart = (value) => {
  return String(value || "file")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
};

export const buildPublicId = (scope, fileName = "file") => {
  const base = sanitizePart(path.parse(fileName).name || "file");
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 1e8)}`;
  return `${sanitizePart(scope)}_${base}_${suffix}`;
};

export const toStoredName = (publicId) => `${CLOUDINARY_PREFIX}${publicId}`;

export const getPublicIdFromStoredName = (storedName) => {
  if (!storedName || typeof storedName !== "string") return "";
  if (!storedName.startsWith(CLOUDINARY_PREFIX)) return "";
  return storedName.slice(CLOUDINARY_PREFIX.length);
};

export const isCloudinaryStoredName = (storedName) => Boolean(getPublicIdFromStoredName(storedName));

export const uploadImageFromPath = async (filePath, { scope = "image", originalName = "file" } = {}) => {
  ensureCloudinaryConfigured();
  const publicId = buildPublicId(scope, originalName);
  const transformation = getUploadTransformationForScope(scope);

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "image",
    public_id: publicId,
    overwrite: true,
    unique_filename: false,
    transformation,
  });

  return {
    publicId,
    storedName: toStoredName(publicId),
    secureUrl: result.secure_url,
  };
};

export const uploadPdfFromPath = async (filePath, { scope = "pdf", originalName = "file.pdf" } = {}) => {
  ensureCloudinaryConfigured();
  const publicId = buildPublicId(scope, originalName);

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw",
    type: "upload",
    access_mode: "public",
    public_id: publicId,
    overwrite: true,
    unique_filename: false,
    format: "pdf",
  });

  return {
    publicId,
    storedName: toStoredName(publicId),
    secureUrl: result.secure_url,
  };
};

export const buildOptimizedImageUrlFromStoredName = (storedName) => {
  const publicId = getPublicIdFromStoredName(storedName);
  if (!publicId) return "";

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "image",
    type: "upload",
    fetch_format: "auto",
    quality: "auto",
  });
};

export const buildOptimizedPdfUrlFromStoredName = (storedName, { attachment = false } = {}) => {
  const publicId = getPublicIdFromStoredName(storedName);
  if (!publicId) return "";

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: "raw",
    type: "upload",
    flags: attachment ? "attachment" : undefined,
  });
};

export const buildPrivatePdfUrlFromStoredName = (storedName, { attachment = false } = {}) => {
  const publicId = getPublicIdFromStoredName(storedName);
  if (!publicId || !isCloudinaryConfigured()) return "";

  return cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "raw",
    type: "upload",
    attachment,
  });
};

export const deleteCloudinaryAssetByStoredName = async (storedName, resourceType = "image") => {
  const publicId = getPublicIdFromStoredName(storedName);
  if (!publicId || !isCloudinaryConfigured()) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};
