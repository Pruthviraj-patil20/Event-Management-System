const QRCode = require('qrcode');

/**
 * Generates a high-resolution QR code data URL from ticket payload
 * @param {Object|String} payload
 * @returns {Promise<String>} Data URL
 */
const generateQRCode = async (payload) => {
  try {
    const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (err) {
    throw new Error(`Failed to generate QR Code: ${err.message}`);
  }
};

module.exports = { generateQRCode };
