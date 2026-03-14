import dotenv from 'dotenv';
import db from '../config/db.js';
import { getDefaultFromAddress, isResendConfigured, normalizeRecipientList, sendResendEmail } from '../utils/resendEmail.js';

dotenv.config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value) => String(value || '').trim().replace(/^['"`]+|['"`]+$/g, '');

const parseRecipientList = (rawValue) => {
  const items = normalizeRecipientList(rawValue)
    .map((item) => normalizeEmail(item))
    .filter(Boolean);

  if (!items.length) return [];

  for (const address of items) {
    if (!EMAIL_REGEX.test(address)) {
      throw new Error(`Invalid support recipient email configured: ${address}`);
    }
  }

  return items;
};

export const sendSupportMessage = async (req, res) => {
  try {
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    // Autofill name/email if user is authenticated
    let name = String(req.body?.name || '').trim();
    let email = normalizeEmail(req.body?.email);

    if (req.user && req.user.id) {
      // try to get user details from DB (firstName, lastName, email)
      const [rows] = await db.execute('SELECT firstName, lastName, email FROM account_tbl WHERE accId = ?', [req.user.id]);
      if (rows && rows.length > 0) {
        const u = rows[0];
        name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || name;
        email = normalizeEmail(u.email || email);
      }
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid requester email address.' });
    }

    if (!isResendConfigured()) {
      console.error('Resend is not configured. Check RESEND_API_KEY and RESEND_FROM.');
      return res.status(500).json({ success: false, message: 'Email service not configured on server. Contact administrator.' });
    }

    const supportTo = process.env.SUPPORT_EMAIL;
    const resendFrom = process.env.RESEND_SUPPORT_FROM || getDefaultFromAddress();

    if (!supportTo) {
      return res.status(500).json({ success: false, message: 'Support destination email is not configured on server.' });
    }

    let recipients = [];
    try {
      recipients = parseRecipientList(supportTo);
    } catch (recipientError) {
      console.error('Invalid SUPPORT_EMAIL configuration:', recipientError.message);
      return res.status(500).json({ success: false, message: 'Support destination email is invalid on server configuration.' });
    }

    if (!recipients.length) {
      return res.status(500).json({ success: false, message: 'Support destination email is not configured on server.' });
    }

    const info = await sendResendEmail({
      from: resendFrom,
      to: recipients,
      subject: `[Support] ${subject}`,
      replyTo: email,
      headers: {
        'X-Support-Requester-Name': name,
        'X-Support-Requester-Email': email
      },
      html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;padding:20px;">
      <tr>
        <td style="background:#ffffff;border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.05);overflow:hidden;">
          
          <!-- HEADER -->
          <div style="background:#2c7be5;color:white;padding:20px 30px;">
            <h2 style="margin:0;">📩 New Support Message</h2>
          </div>

          <!-- BODY -->
          <div style="padding:30px;color:#333;">
            
            <p style="margin-top:0;font-size:15px;">
              You received a new support request from your website.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
              <tr>
                <td style="padding:8px 0;"><strong>Name:</strong></td>
                <td style="padding:8px 0;">${name}</td>
              </tr>

              <tr>
                <td style="padding:8px 0;"><strong>Email:</strong></td>
                <td style="padding:8px 0;">
                  <a href="mailto:${email}" style="color:#2c7be5;text-decoration:none;">
                    ${email}
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:8px 0;"><strong>Subject:</strong></td>
                <td style="padding:8px 0;">${subject}</td>
              </tr>
            </table>

            <!-- MESSAGE BOX -->
            <div style="
              background:#f7f9fc;
              border-left:4px solid #2c7be5;
              padding:20px;
              border-radius:6px;
              white-space:pre-line;
              line-height:1.6;
            ">
              ${message}
            </div>

          </div>

          <!-- FOOTER -->
          <div style="
            text-align:center;
            padding:15px;
            font-size:12px;
            color:#888;
            border-top:1px solid #eee;
          ">
            This email was sent from your website support form.
          </div>

        </td>
      </tr>
    </table>

  </div>
`
    });


    return res.json({ success: true, message: 'Support message sent' });
  } catch (err) {
    console.error('❌ Error sending support message:', err);
    return res.status(500).json({ success: false, message: 'Failed to send support message', error: err.message });
  }
};

export default { sendSupportMessage };
