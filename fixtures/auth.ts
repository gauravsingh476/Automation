// Re-exports test and expect from Playwright.
// Auth state is applied globally via storageState in playwright.config.ts.
// Tests that need an unauthenticated page (e.g. login tests) should call:
//   test.use({ storageState: { cookies: [], origins: [] } });
export { test, expect } from "@playwright/test";
