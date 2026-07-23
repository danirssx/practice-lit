// Build-time replacement for the `roarr` package selected when .env contains
// ROARR_DISABLED=true. `__disabled` is an internal module marker, not the .env value.
// It preserves Roarr's public logger shape so every existing log call is safe, while
// deliberately producing no packet, console output, or async context.

const noop = () => undefined;

function createNoopLogger() {
  const logger = noop;

  logger.child = () => logger;
  logger.getContext = () => ({});
  logger.adopt = async (routine) => routine();

  for (const level of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']) {
    logger[level] = noop;
    logger[`${level}Once`] = noop;
  }

  return logger;
}

// Replace any pre-existing global state: disabled mode has no `write` route.
export const ROARR = globalThis.ROARR = { __disabled: true };
export const Roarr = createNoopLogger();

export const logLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export function getLogLevelName(level) {
  if (level <= logLevels.trace) return 'trace';
  if (level <= logLevels.debug) return 'debug';
  if (level <= logLevels.info) return 'info';
  if (level <= logLevels.warn) return 'warn';
  if (level <= logLevels.error) return 'error';
  return 'fatal';
}
