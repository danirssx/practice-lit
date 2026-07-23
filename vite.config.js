import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

import { readRoarrDisabled } from './scripts/read-roarr-disabled.mjs';

export default defineConfig(({ mode }) => {
  // This is evaluated only by Vite's Node-side configuration. The unprefixed flag
  // is not exposed as import.meta.env or as a browser runtime value.
  const envFile = fileURLToPath(new URL('./.env', import.meta.url));
  const roarrIsDisabled = mode === 'quiet' || readRoarrDisabled(envFile);

  return {
    resolve: {
      alias: roarrIsDisabled
        ? {
            roarr: fileURLToPath(new URL('./src/platform/roarr-stub.js', import.meta.url)),
          }
        : {},
    },
    build: {
      rollupOptions: {
        input: 'index.html',
      },
    },
  };
});
