const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = {
  error: (...args) => {
    if (levels.error <= levels[currentLevel]) {
      console.error(`[ERROR] ${new Date().toISOString()}`, ...args);
    }
  },
  warn: (...args) => {
    if (levels.warn <= levels[currentLevel]) {
      console.warn(`[WARN]  ${new Date().toISOString()}`, ...args);
    }
  },
  info: (...args) => {
    if (levels.info <= levels[currentLevel]) {
      console.info(`[INFO]  ${new Date().toISOString()}`, ...args);
    }
  },
  debug: (...args) => {
    if (levels.debug <= levels[currentLevel]) {
      console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args);
    }
  },
};

module.exports = logger;
