const ensureProtocol = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const configuredApiUrl =
  process.env.REACT_APP_API_URL || process.env.REACT_APP_API || "";

const browserOrigin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "";

const isLocalhostOrigin = /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  browserOrigin,
);

const localApiFallback = "http://localhost:5000/api";

export const API_BASE_URL = (
  ensureProtocol(configuredApiUrl) ||
  (isLocalhostOrigin ? localApiFallback : `${browserOrigin}/api`)
).replace(
  /\/+$/,
  "",
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, "");

export const SOCKET_URL = (
  ensureProtocol(process.env.REACT_APP_SOCKET_URL || "") || API_ORIGIN
).replace(/\/+$/, "");

export const buildMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${normalizedPath}` : normalizedPath;
};
