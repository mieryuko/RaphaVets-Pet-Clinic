import { Resend } from "resend";

let resendClient = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

export const isResendConfigured = () => {
  return Boolean(process.env.RESEND_API_KEY && (process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL));
};

export const getDefaultFromAddress = () => {
  return process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || "";
};

export const sendResendEmail = async ({ to, subject, html, from, replyTo, headers }) => {
  const client = getResendClient();
  if (!client) {
    throw new Error("Resend is not configured. Missing RESEND_API_KEY.");
  }

  const finalFrom = from || getDefaultFromAddress();
  if (!finalFrom) {
    throw new Error("Resend sender is not configured. Missing RESEND_FROM or RESEND_FROM_EMAIL.");
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
