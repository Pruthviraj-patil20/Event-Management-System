const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'platform',
      unique: true
    },
    platform: {
      name: { type: String, default: 'EventSphere' },
      tagline: { type: String, default: 'Premium Event Management Platform' },
      logo: { type: String, default: '' },
      supportEmail: { type: String, default: 'support@eventsphere.io' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      maintenanceMode: { type: Boolean, default: false }
    },
    event: {
      defaultStatus: { type: String, default: 'pending' },
      maxCapacity: { type: Number, default: 10000 },
      allowReviews: { type: Boolean, default: true }
    },
    payment: {
      currency: { type: String, default: 'INR' },
      enablePayments: { type: Boolean, default: true },
      gatewayName: { type: String, default: 'Stripe / Razorpay' }
    },
    notification: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      approvalEmails: { type: Boolean, default: true }
    },
    security: {
      allowRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 60 }
    },
    appearance: {
      defaultTheme: { type: String, default: 'light' },
      accentColor: { type: String, default: '#6366F1' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);