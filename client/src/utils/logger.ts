/**
 * Logger utility for conditional console logging
 * Prevents console.log in production builds
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    // Always show warnings
    console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    // Always show errors
    console.error(...args);
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Force log even in production (use sparingly)
  force: (...args: unknown[]) => {
    console.log(...args);
  }
};

export default logger;
