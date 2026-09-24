const API_VERSION = 'v21.0'; // check developers.facebook.com for the current version periodically
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Normalizes an Indian mobile number to WhatsApp's required format:
 * international, digits only, no leading + or 0.
 * '9876543210' -> '919876543210'; '+91 98765 43210' -> '919876543210'
 */
function normalizeIndianNumber(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits; // fallback — let the API reject it rather than guess wrong
}

async function sendTemplate(toRaw, templateName, params) {
  const to = normalizeIndianNumber(toRaw);
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: params.map((p) => ({ type: 'text', text: String(p) })),
            },
          ],
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error('WhatsApp send failed:', data);
  } catch (err) {
    // Best-effort — same rule as email: never let a failed notification fail the booking
    console.error('WhatsApp send error:', err.message);
  }
}

async function sendBookingConfirmationWhatsApp({ phone, name, guests, date, time, bookingNumber }) {
  if (!phone) return;
  await sendTemplate(phone, 'booking_confirmation', [name, guests, date, time, bookingNumber]);
}

async function sendAdminLeadNotificationWhatsApp({ name, phone, guests, date, time, bookingNumber }) {
  if (!process.env.ADMIN_WHATSAPP_NUMBER) return;
  await sendTemplate(process.env.ADMIN_WHATSAPP_NUMBER, 'new_booking_alert', [name, phone, guests, date, time, bookingNumber]);
}

module.exports = { sendBookingConfirmationWhatsApp, sendAdminLeadNotificationWhatsApp };
