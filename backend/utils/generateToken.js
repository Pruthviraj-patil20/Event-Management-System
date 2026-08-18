const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

module.exports = { generateToken, verifyToken };
