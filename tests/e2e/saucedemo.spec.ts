import { expect, test } from '@playwright/test';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { InventoryPage } from '../../src/pages/InventoryPage';

const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';
const FIRST_PRODUCT = 'Sauce Labs Onesie';
const SECOND_PRODUCT = 'Sauce Labs Bike Light';

async function loginAsStandardUser(inventoryPage: InventoryPage): Promise<void> {
  await inventoryPage.goto();
  await inventoryPage.login(USERNAME, PASSWORD);
}

test.describe('SauceDemo purchase flow', () => {
  test('sorts products by price and completes an order with the first two products', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginAsStandardUser(inventoryPage);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();

    await inventoryPage.sortProductsByPrice('low-to-high');
    await expect(page.getByText(FIRST_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText(SECOND_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText('$7.99', { exact: true })).toBeVisible();
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();

    await inventoryPage.addProductToCart(0);
    await inventoryPage.addProductToCart(1);
    await expect(page.getByRole('button', { name: 'Cart, 2 items' })).toBeVisible();
    await page.getByRole('button', { name: 'Cart, 2 items' }).click();

    await expect(page).toHaveURL(/cart\.html/);
    await checkoutPage.expectCartProductCount(2);
    await expect(page.getByText(FIRST_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText(SECOND_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText('$7.99', { exact: true })).toBeVisible();
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();
    await checkoutPage.enterCustomerInformation('Ada', 'Lovelace', '12345');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await checkoutPage.expectCartProductCount(2);
    await expect(page.getByText(/Item total: \$17\.98/)).toBeVisible();
    await expect(page.getByText(/Tax: \$1\.44/)).toBeVisible();
    await expect(page.getByText(/Total: \$19\.42/)).toBeVisible();

    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderConfirmation();
  });

  test('shows an error when login credentials are invalid', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.goto();
    await inventoryPage.login(USERNAME, 'invalid-password');

    await expect(
      page.getByText(
        'Epic sadface: Username and password do not match any user in this service',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('sorts inventory products by ascending price without adding items', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAsStandardUser(inventoryPage);
    await inventoryPage.sortProductsByPrice('low-to-high');

    await expect(page.getByText(FIRST_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText(SECOND_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(6);
  });

  test('keeps an empty cart free of products and order confirmation', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginAsStandardUser(inventoryPage);
    await page.getByRole('button', { name: 'Cart, empty' }).click();

    await expect(page).toHaveURL(/cart\.html/);
    await checkoutPage.expectCartProductCount(0);
    await expect(
      page.getByText('Thank you for your order!', { exact: true }),
    ).toHaveCount(0);
  });

  test('requires checkout information before continuing', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await loginAsStandardUser(inventoryPage);
    await inventoryPage.addProductToCart(0);
    await page.getByRole('button', { name: /^Cart, 1 items?$/ }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Error: First Name is required', { exact: true }))
      .toBeVisible();
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);

    await page.getByPlaceholder('First Name').fill('Ada');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('Error: Last Name is required', { exact: true }))
      .toBeVisible();
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Thank you for your order!', { exact: true }))
      .toHaveCount(0);
  });

  test('preserves order details when returning from the order summary', async ({
    page,
  }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginAsStandardUser(inventoryPage);
    await inventoryPage.sortProductsByPrice('low-to-high');
    await inventoryPage.addProductToCart(0);
    await inventoryPage.addProductToCart(1);
    await page.getByRole('button', { name: 'Cart, 2 items' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
    await checkoutPage.enterCustomerInformation('Ada', 'Lovelace', '12345');
    await page.getByRole('button', { name: 'Continue' }).click();

    await checkoutPage.expectCartProductCount(2);
    await expect(page.getByText(/Item total: \$17\.98/)).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
    await page.getByRole('button', { name: 'Cart, 2 items' }).click();
    await expect(page).toHaveURL(/cart\.html/);
    await checkoutPage.expectCartProductCount(2);
    await expect(page.getByText(FIRST_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText(SECOND_PRODUCT, { exact: true })).toBeVisible();
    await expect(page.getByText('Thank you for your order!', { exact: true }))
      .toHaveCount(0);
  });
});
