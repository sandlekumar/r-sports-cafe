/**
 * Email Service
 * Provider-agnostic transactional email via Nodemailer (SMTP).
 * Works with Gmail, Resend, Brevo, SendGrid — only env vars change.
 *
 * All sends are best-effort: a failed email must NEVER fail the
 * booking or cancellation that triggered it.
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a booking confirmation email with a self-service cancel link.
 * Skips silently if no email address was provided (field is optional).
 */
async function sendBookingConfirmation({ email, name, bookingNumber, date, time, guests, cancellationToken }) {
  if (!email) return; // email is optional on the booking form

  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP not configured — skipping confirmation email for', bookingNumber);
    return;
  }

  const clientUrl = process.env.CUSTOMER_SITE_URL || 'http://localhost:5173';
  const cancelUrl = `${clientUrl}/cancel-booking?ref=${bookingNumber}&token=${cancellationToken}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"R Sports & Cafe" <no-reply@rsportscafe.com>',
      to: email,
      subject: `Booking Confirmed — ${bookingNumber}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #1B1B1B; color: #F7F5EF; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 22px; font-weight: 700; letter-spacing: 0.08em; margin: 0; color: #D4AF37;">R SPORTS & CAFE</h1>
          </div>

          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hi ${name},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px;">Your table has been booked! Here are your details:</p>

          <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 6px 0; color: rgba(247,245,239,0.5);">Reference</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #D4AF37;">${bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(247,245,239,0.5);">Date</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 500;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(247,245,239,0.5);">Time</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 500;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: rgba(247,245,239,0.5);">Guests</td>
                <td style="padding: 6px 0; text-align: right; font-weight: 500;">${guests}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: rgba(247,245,239,0.5); margin: 0 0 24px;">
            Need to cancel? Use the link below — no login required.
          </p>

          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${cancelUrl}" style="display: inline-block; padding: 14px 32px; background: transparent; border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; border-radius: 8px;">
              Cancel This Booking
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid rgba(247,245,239,0.1); margin: 24px 0;" />

          <p style="font-size: 12px; line-height: 1.6; color: rgba(247,245,239,0.3); text-align: center; margin: 0;">
            R Sports & Cafe · SNR Nagar, Caldwell Colony, Thoothukudi 628003<br />
            +91 73585 85151
          </p>
        </div>
      `,
    });
    console.log(`📧 Confirmation email sent for ${bookingNumber} → ${email}`);
  } catch (err) {
    // Best-effort — never throw
    console.error('sendBookingConfirmation failed:', err.message);
  }
}

/**
 * Send a notification email to the admin when a new booking is made.
 */
async function sendAdminBookingNotification({ name, phone, email, bookingNumber, date, time, guests, specialRequest }) {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP not configured — skipping admin notification email for', bookingNumber);
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rsportscafe.com';
  const adminDashboardUrl = 'http://localhost:5174';

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"R Sports & Cafe System" <no-reply@rsportscafe.com>',
      to: adminEmail,
      subject: `🚨 New Table Booking — ${bookingNumber}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; color: #111111; border-radius: 12px; border: 1px solid #eaeaea;">
          <h2 style="margin-top: 0; color: #D4AF37;">New Booking Alert</h2>
          <p>A new table booking has been received.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Ref No:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Guests:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${guests}</td>
            </tr>
            ${specialRequest ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Special Request:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #d97706;">${specialRequest}</td>
            </tr>
            ` : ''}
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${adminDashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #111111; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Open Admin Dashboard
            </a>
          </div>
        </div>
      `,
    });
    console.log(`📧 Admin notification email sent for ${bookingNumber} → ${adminEmail}`);
  } catch (err) {
    console.error('sendAdminBookingNotification failed:', err.message);
  }
}

module.exports = { sendBookingConfirmation, sendAdminBookingNotification };
