/**
 * Simulated rich HTML email templates for EventSphere
 */
const ticketConfirmationEmail = ({ userName, eventTitle, ticketNumber, eventDate, venueName, ticketType }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #0B0F19; color: #F8FAFC; padding: 24px; }
    .card { background-color: #111827; border: 1px solid #1F2937; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; }
    .header { border-bottom: 1px solid #1F2937; padding-bottom: 20px; margin-bottom: 24px; text-align: center; }
    .brand { color: #6366F1; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .title { color: #F8FAFC; font-size: 20px; font-weight: 700; margin-top: 12px; }
    .details { background-color: #1E293B; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .label { color: #94A3B8; }
    .value { color: #F8FAFC; font-weight: 600; }
    .footer { text-align: center; color: #64748B; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">EventSphere</div>
      <div class="title">Your Ticket is Confirmed! 🎟️</div>
    </div>
    <p>Hi ${userName},</p>
    <p>You're all set for <strong>${eventTitle}</strong>. Here are your booking details:</p>
    <div class="details">
      <div class="detail-row"><span class="label">Ticket Number:</span> <span class="value">${ticketNumber}</span></div>
      <div class="detail-row"><span class="label">Tier:</span> <span class="value">${ticketType}</span></div>
      <div class="detail-row"><span class="label">Date:</span> <span class="value">${eventDate}</span></div>
      <div class="detail-row"><span class="label">Venue:</span> <span class="value">${venueName}</span></div>
    </div>
    <p>You can access your dynamic QR code pass anytime from your EventSphere dashboard.</p>
    <div class="footer">
      <p>EventSphere — Plan. Discover. Experience.<br/>support@eventsphere.io</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  ticketConfirmationEmail
};
