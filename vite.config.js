import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const roarrIsDisabled = env.VITE_DISABLE_ROARR === 'true';

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
