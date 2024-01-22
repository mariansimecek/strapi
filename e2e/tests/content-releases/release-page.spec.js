import { test, expect } from '@playwright/test';
import { login } from '../../utils/login';
import { resetDatabaseAndImportDataFromPath } from '../../scripts/dts-import';

// TODO: Create separate github workflow for EE e2e tests

const edition = process.env.STRAPI_DISABLE_EE === 'true' ? 'CE' : 'EE';
/**
 * Execute a test suite only if the condition is true
 * @return Jest.Describe
 */
const describeOnCondition = (bool) => (bool ? test.describe : test.describe.skip);

describeOnCondition(edition === 'EE')('List View', () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabaseAndImportDataFromPath('./e2e/data/with-admin.tar');
    await page.goto('/admin');
    await login({ page });
  });

  test('A releases test should pass', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Releases' })).toBeVisible();
  });
});
