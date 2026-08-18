const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Create and send an in-app notification
   */
  static async sendNotification({ recipientId, title, message, type = 'system', link = '' }) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        link
      });
      return notification;
    } catch (err) {
      logger.error(`Failed to create notification for user ${recipientId}: ${err.message}`);
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = NotificationService;
