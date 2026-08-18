const logger = require('../utils/logger');
const { ticketConfirmationEmail } = require('../utils/emailTemplates');

class EmailService {
  /**
   * Simulate or send ticket confirmation email
   */
  static async sendTicketConfirmation({ to, userName, eventTitle, ticketNumber, eventDate, venueName, ticketType }) {
    try {
      const html = ticketConfirmationEmail({
        userName,
        eventTitle,
        ticketNumber,
        eventDate,
        venueName,
        ticketType
      });
      // In production environment, this integrates with nodemailer / SendGrid / SES
      logger.info(`[Email Dispatcher] Ticket confirmation email successfully generated for: ${to} (Ticket: ${ticketNumber})`);
      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (err) {
      logger.error(`Error sending email to ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Simulate sending password reset email
   */
  static async sendPasswordReset({ to, resetUrl }) {
    logger.info(`[Email Dispatcher] Password reset link sent to: ${to} -> ${resetUrl}`);
    return { success: true };
  }
}

module.exports = EmailService;
