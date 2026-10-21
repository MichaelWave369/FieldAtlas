import { defineConfig, devices } from '@playwright/test';
import { CURRENT_PUBLISHED_ORIGIN } from './scripts/launch-preflight.mjs';

/** Production is read-only: no webServer, no local builds, no DNS changes. */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/live-site.spec.js',
  timeout: 35_000,
  expect: { timeout: 15_000 },
  retries: 2,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: CURRENT_PUBLISHED_ORIGIN,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 25_000,
  },
  projects: [
    { name: 'public-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'public-mobile', use: { ...devices['Pixel 7'] } },
  ],
});
