// A small browser adapter around Roarr, following Zigzag's logger pattern.
//
// Modules create a namespaced logger once:
//   const log = createLogger('tasks');
//   log.info({ taskId }, 'task created');
//
// The application composition root calls initLogger() before it creates stores.
// Logs are disabled by default. In DevTools, use practiceDebug.enable('tasks')
// or practiceDebug.all() to opt into the output you need.

import { Roarr, getLogLevelName } from 'roarr';

// The build config aliases `roarr` to a stub when its private Node-side .env
// decision disables it. The marker comes from that stub, not from import.meta.env.
const ROARR_DISABLED = globalThis.ROARR?.__disabled === true;

const LEVEL_COLORS = {
  trace: '#6b7280',
  debug: '#2563eb',
  info: '#15803d',
  warn: '#b45309',
  error: '#dc2626',
  fatal: '#991b1b',
};

const LEVEL_METHODS = {
  trace: 'debug',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
};

function getMinLevel() {
  try {
    const configuredLevel = localStorage.getItem('debug:level');
    return configuredLevel ? Number.parseInt(configuredLevel, 10) : 20;
  } catch {
    return 20;
  }
}

function isEnabled(namespace, logLevel) {
  try {
    const allNamespacesEnabled = localStorage.getItem('debug:*') === '1';
    const namespaceEnabled = localStorage.getItem(`debug:${namespace}`) === '1';
    return (allNamespacesEnabled || namespaceEnabled) && logLevel >= getMinLevel();
  } catch {
    // Logging must never break the application when storage is unavailable.
    return false;
  }
}

// A child logger automatically adds its namespace to every structured record.
export function createLogger(namespace) {
  return Roarr.child({ namespace });
}

// Call once, before application stores start doing work. Roarr serializes each log
// record; this writer turns that record into a readable, filterable browser console log.
export function initLogger() {
  // The disabled Vite build aliases `roarr` to a no-op module. Do not install a
  // writer or DevTools controls in that mode, so no packet can reach the console.
  if (ROARR_DISABLED) return;

  globalThis.ROARR = globalThis.ROARR || {};
  globalThis.ROARR.write = (serialized) => {
    try {
      // Roarr creates all five packet fields. The practice app displays sequence
      // and version too, whereas Zigzag intentionally keeps them in the raw packet.
      const { context, message, sequence, time, version } = JSON.parse(serialized);
      const namespace = context?.namespace || '?';
      const logLevel = context?.logLevel || 30;
      const levelName = getLogLevelName(logLevel) || 'info';

      if (!isEnabled(namespace, logLevel)) return;

      const timestamp = new Date(time).toISOString().slice(11, 23);
      const color = LEVEL_COLORS[levelName] || '#374151';
      const method = LEVEL_METHODS[levelName] || 'log';
      const details = { ...context };
      delete details.namespace;
      delete details.logLevel;

      const prefix = `%c${timestamp} %c${levelName.toUpperCase().padEnd(5)} %c[${namespace}] %c#${sequence} format:${version}%c ${message}`;
      const styles = [
        'color:#6b7280',
        `color:${color};font-weight:bold`,
        'color:#7c3aed',
        'color:#6b7280;font-style:italic',
        'color:inherit',
      ];

      if (Object.keys(details).length > 0) {
        console[method](prefix, ...styles, details);
      } else {
        console[method](prefix, ...styles);
      }
    } catch {
      // Keep the raw record available if a malformed value reaches the writer.
      console.log('[roarr]', serialized);
    }
  };

  if (typeof window !== 'undefined') {
    window.practiceDebug = {
      enable(namespace) {
        localStorage.setItem(`debug:${namespace}`, '1');
        console.log(`Enabled debug:${namespace}`);
      },
      disable(namespace) {
        localStorage.removeItem(`debug:${namespace}`);
        console.log(`Disabled debug:${namespace}`);
      },
      all() {
        localStorage.setItem('debug:*', '1');
        console.log('Enabled all practice loggers');
      },
      none() {
        localStorage.removeItem('debug:*');
        console.log('Disabled all practice loggers');
      },
      level(level) {
        localStorage.setItem('debug:level', String(level));
        console.log(`Minimum log level: ${level} (${getLogLevelName(level)})`);
      },
      status() {
        const entries = [];
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (key?.startsWith('debug:')) entries.push(`${key} = ${localStorage.getItem(key)}`);
        }
        console.log(entries.length ? entries.join('\n') : 'No debug flags set. Try practiceDebug.enable(\'tasks\').');
      },
    };
  }
}
