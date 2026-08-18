const mongoose = require('mongoose');
const env = require('./environment');
const logger = require('../utils/logger');

let memoryServerInstance = null;

const connectDB = async () => {
  try {
    // Attempt connecting to the configured URI
    const conn = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 2500
    });
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    logger.warn(`Could not connect to MongoDB at ${env.mongodbUri} (${err.message}). Starting MongoDB In-Memory Server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const uri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(uri);
      logger.info(`MongoDB In-Memory Server started & connected successfully: ${uri}`);
      return conn;
    } catch (memErr) {
      logger.error(`Failed to connect to both primary MongoDB and In-Memory fallback: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
