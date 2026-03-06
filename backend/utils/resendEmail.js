import { Resend } from "resend";

let resendClient = null;

const EMAIL_ONLY_REGEX = /^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/;
const NAME_AND_EMAIL_REGEX = /^(.*)<\s*([^<>@\s]+@[^<>@\s]+\.[^<>@\s]+)\s*>$/;
const EMAIL_IN_TEXT_REGEX = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i;

const normalizeEnvValue = (value) => {
  if (value === undefined || value === null) return "";
  // Trim invisible whitespace and tolerate accidental wrapped quotes/backticks.
  return String(value).trim().replace(/^[`'\"]+|[`'\"]+$/g, "").trim();
};

const normalizeFromAddress = (value) => {
  const raw = normalizeEnvValue(value);
  if (!raw) return "";

  // Remove stray quoting characters that often come from copied env values.
  const cleaned = raw.replace(/[\u2018\u2019\u201C\u201D`'\"]/g, "").trim();
  if (!cleaned) return "";

  if (EMAIL_ONLY_REGEX.test(cleaned)) {
    return cleaned;
  }

  const nameEmailMatch = cleaned.match(NAME_AND_EMAIL_REGEX);
  if (nameEmailMatch) {
    const name = nameEmailMatch[1].trim();
    const email = nameEmailMatch[2].trim();
    return name ? `${name} <${email}>` : email;
  }

  // Last-resort recovery: if a valid email appears anywhere, use plain email format.
  const emailMatch = cleaned.match(EMAIL_IN_TEXT_REGEX);
  return emailMatch ? emailMatch[1].trim() : "";
};

const getResendClient = () => {
  const apiKey = normalizeEnvValue(process.env.RESEND_API_KEY);
  if (!apiKey) return null;

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

export const isResendConfigured = () => {
  return Boolean(
    normalizeEnvValue(process.env.RESEND_API_KEY) &&
    (normalizeFromAddress(process.env.RESEND_FROM) || normalizeFromAddress(process.env.RESEND_FROM_EMAIL))
  );
};

export const getDefaultFromAddress = () => {
  return normalizeFromAddress(process.env.RESEND_FROM) || normalizeFromAddress(process.env.RESEND_FROM_EMAIL) || "";
};

export const sendResendEmail = async ({ to, subject, html, from, replyTo, headers }) => {
  const client = getResendClient();
  if (!client) {
    throw new Error("Resend is not configured. Missing RESEND_API_KEY.");
  }

  const finalFrom = normalizeFromAddress(from) || getDefaultFromAddress();
  if (!finalFrom) {
    throw new Error("Resend sender is not configured or has invalid format. Use email@example.com or Name <email@example.com>.");
  }

  const payload = {
    from: finalFrom,
    to,
    subject,
    html,
  };

  if (replyTo) payload.reply_to = replyTo;
  if (headers && typeof headers === "object") payload.headers = headers;

  const { data, error } = await client.emails.send(payload);
  if (error) {
    throw new Error(error.message || "Resend email send failed");
  }

  return data;
};
