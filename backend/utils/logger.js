const logger = {
  info: (msg, ...args) => {
    console.log(`\x1b[36m[EventSphere INFO]\x1b[0m ${msg}`, ...args);
  },
  success: (msg, ...args) => {
    console.log(`\x1b[32m[EventSphere SUCCESS]\x1b[0m ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`\x1b[33m[EventSphere WARN]\x1b[0m ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`\x1b[31m[EventSphere ERROR]\x1b[0m ${msg}`, ...args);
  }
};

module.exports = logger;
