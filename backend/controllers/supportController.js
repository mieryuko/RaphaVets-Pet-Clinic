import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import db from '../config/db.js';

dotenv.config();

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = (process.env.SMTP_SECURE === 'true');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP not fully configured: SMTP_HOST/SMTP_USER/SMTP_PASS are required');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 7000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 7000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
      dnsTimeout: Number(process.env.SMTP_DNS_TIMEOUT || 7000)
    });
  } catch (err) {
    console.error('Failed to create SMTP transporter:', err);
    return null;
  }
};

export const sendSupportMessage = async (req, res) => {
  try {
    const { subject, message } = req.body || {};

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    // Autofill name/email if user is authenticated
    let name = req.body.name;
    let email = req.body.email;

    if (req.user && req.user.id) {
      // try to get user details from DB (firstName, lastName, email)
      const [rows] = await db.execute('SELECT firstName, lastName, email FROM account_tbl WHERE accId = ?', [req.user.id]);
      if (rows && rows.length > 0) {
        const u = rows[0];
        name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || name;
        email = u.email || email;
      }
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const transporter = createTransporter();

    if (!transporter) {
      console.error('SMTP transporter not available. Check .env configuration.');
      return res.status(500).json({ success: false, message: 'SMTP not configured on server. Contact administrator.' });
    }

    const supportTo = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
    const smtpFromRaw = process.env.SMTP_FROM || process.env.SMTP_USER;
    const smtpFromMatch = typeof smtpFromRaw === 'string' ? smtpFromRaw.match(/<([^>]+)>/) : null;
    const smtpFrom = (smtpFromMatch ? smtpFromMatch[1] : smtpFromRaw || '').trim();

    if (!supportTo) {
      return res.status(500).json({ success: false, message: 'Support destination email is not configured on server.' });
    }

    const mailOptions = {
      from: {
        name: 'RaphaVets Support',
        address: smtpFrom
      },
      sender: smtpFrom,
      to: supportTo,
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

    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Support email sent:', info.messageId);

    return res.json({ success: true, message: 'Support message sent' });
  } catch (err) {
    console.error('❌ Error sending support message:', err);
    return res.status(500).json({ success: false, message: 'Failed to send support message', error: err.message });
  }
};

export default { sendSupportMessage };
