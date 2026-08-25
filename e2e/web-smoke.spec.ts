import { expect, test } from '@playwright/test';

const email = `web-smoke-${Date.now()}@example.test`;
const password = 'Correct-Horse-Battery-Staple-321!';

test('landing page renders the product shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('هم‌قدم')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ورود یا ثبت‌نام' })).toBeVisible();
  await expect(page.getByText('این فضا فقط برای دو نفر طراحی شده است.')).not.toBeVisible();
});

test('registration form is reachable and can create a session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ورود یا ثبت‌نام' }).click();
  await expect(page.getByText('خوش برگشتی')).toBeVisible();
  await page.getByText('حساب نداری؟ ثبت‌نام کن').click();
  await page.getByPlaceholder('نام').fill('Web Smoke');
  await page.getByPlaceholder('ایمیل').fill(email);
  await page.getByPlaceholder('رمز عبور').fill(password);
  await page.getByRole('button', { name: 'ثبت‌نام' }).click();
  await expect(page).toHaveURL(/\/home$/);
});
