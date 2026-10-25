import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.tsx'],
    clearMocks: true,
    env: {
      VITE_AUTH_LOGIN_URL: '',
      VITE_AUTH_ME_URL: '',
      VITE_AUTH_REGISTER_URL: '',
      VITE_AUTH_LOGOUT_URL: '',
      VITE_PROFILE_URL: '',
      VITE_RESUME_GENERATE_URL: '',
      VITE_RESUME_AUDIO_GENERATE_URL: '',
      VITE_JOBS_URL: '',
      VITE_JOB_RECOMMENDATIONS_URL: '',
      VITE_JOB_APPLICATION_PLAN_URL: '',
      VITE_JOB_APPLICATION_SUBMIT_URL: '',
    },
  },
});
