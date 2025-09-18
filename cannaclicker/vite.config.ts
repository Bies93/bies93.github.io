import { defineConfig, loadEnv } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH && env.VITE_BASE_PATH.length > 0 ? env.VITE_BASE_PATH : '/';

  return {
    base,
    plugins: [
      compression({ algorithm: 'brotliCompress', ext: '.br' }),
      compression({ algorithm: 'gzip', ext: '.gz' }),
    ],
    build: {
      sourcemap: mode !== 'production' ? true : false,
    },
  };
});