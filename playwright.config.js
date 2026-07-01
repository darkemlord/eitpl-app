import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:8765",
    headless: true,
    channel: "chrome",
  },
  webServer: {
    command: "python3 -m http.server 8765",
    url: "http://127.0.0.1:8765",
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
