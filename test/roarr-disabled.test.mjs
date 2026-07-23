import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRoarrDisabled } from '../scripts/read-roarr-disabled.mjs';

test('only the exact true value disables Roarr', () => {
  assert.equal(parseRoarrDisabled('ROARR_DISABLED=true'), true);
  assert.equal(parseRoarrDisabled('ROARR_DISABLED=false'), false);
  assert.equal(parseRoarrDisabled('ROARR_DISABLED=TRUE'), false);
  assert.equal(parseRoarrDisabled('ROARR_DISABLED=1'), false);
  assert.equal(parseRoarrDisabled(''), false);
});

test('the reader accepts whitespace, comments, quotes, and a later override', () => {
  const source = [
    '# local development settings',
    ' ROARR_DISABLED = "true" # suppress diagnostics',
    'UNRELATED_SETTING=leave-me-alone',
    'export ROARR_DISABLED = false',
  ].join('\n');

  assert.equal(parseRoarrDisabled(source), false);
  assert.equal(parseRoarrDisabled("ROARR_DISABLED = 'true'"), true);
  assert.equal(parseRoarrDisabled('ROARR_DISABLED = "true" # a comment'), true);
});
