/**
 * EventSphere — Persistent In-Memory MongoDB Launcher
 *
 * Useful when no local MongoDB instance is installed. Starts a
 * mongodb-memory-server, writes its connection URI to `.dev-db-uri`,
 * and keeps it alive so `npm run seed` and `npm start` share one DB.
 *
 * Usage:
 *   node database/dev-db.js &
 *   export MONGODB_URI=$(cat database/.dev-db-uri)
 *   npm run seed
 *   npm start
 */

const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const URI_FILE = path.join(__dirname, '.dev-db-uri');

const start = async () => {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  fs.writeFileSync(URI_FILE, uri);
  console.log(`[dev-db] MongoDB in-memory server started: ${uri}`);
  console.log(`[dev-db] Connection URI written to ${URI_FILE}`);
  console.log('[dev-db] Press Ctrl+C to stop.');

  const shutdown = async () => {
    await server.stop();
    try { fs.unlinkSync(URI_FILE); } catch (e) { /* ignore */ }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((err) => {
  console.error('[dev-db] Failed to start in-memory MongoDB:', err.message);
  process.exit(1);
});