import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  console.log("Page title", page.title);
  expect(await page.title()).toContain('LLM');
});
