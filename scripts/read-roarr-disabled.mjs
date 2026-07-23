import { readFileSync } from 'node:fs';

/**
 * Read only the build-time Roarr switch from dotenv-style text.
 *
 * This is intentionally not a general .env loader: it neither mutates
 * process.env nor reads any unrelated setting. Missing, malformed, and values
 * other than the exact string `true` leave Roarr enabled.
 */
export function parseRoarrDisabled(source) {
  let disabled = false;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const assignment = line.match(/^(?:export\s+)?ROARR_DISABLED\s*=\s*(.*)$/);
    if (!assignment) continue;

    let value = assignment[1].trim();
    const quoted = value.match(/^(['"])(.*?)\1(?:\s+#.*)?$/);
    if (quoted) {
      value = quoted[2];
    } else {
      // Permit a normal dotenv-style trailing comment for this boolean only.
      value = value.replace(/\s+#.*$/, '').trim();
    }

    // As with environment files, a later assignment overrides an earlier one.
    disabled = value === 'true';
  }

  return disabled;
}

export function readRoarrDisabled(envFile) {
  try {
    return parseRoarrDisabled(readFileSync(envFile, 'utf8'));
  } catch {
    // A local .env is optional. Absence must retain normal logging.
    return false;
  }
}
