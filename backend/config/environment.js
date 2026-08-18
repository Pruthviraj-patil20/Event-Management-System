const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsphere',
  jwtSecret: process.env.JWT_SECRET || 'eventsphere_fallback_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  emailUser: process.env.EMAIL_USER || 'notifications@eventsphere.io',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  paymentKey: process.env.PAYMENT_KEY || 'rzp_test_eventsphere_key',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ''
};
