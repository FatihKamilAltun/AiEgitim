import { expect, type Locator, type Page } from '@playwright/test';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';

export class CheckoutPage {
  private readonly cartProductNames: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly finishButton: Locator;
  private readonly orderConfirmationMessage: Locator;

  constructor(readonly page: Page) {
    this.cartProductNames = page.getByText(/^Sauce Labs .+$/);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.orderConfirmationMessage = page.getByText(
      'Thank you for your order!',
      { exact: true },
    );
  }

  async goto(url: string = SAUCEDEMO_URL): Promise<void> {
    await this.page.goto(url);
  }

  async expectCartProductCount(expectedCount: number): Promise<void> {
    if (!Number.isInteger(expectedCount) || expectedCount < 0) {
      throw new RangeError('Expected product count must be a non-negative integer.');
    }

    await expect(this.cartProductNames).toHaveCount(expectedCount);
  }

  async enterCustomerInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderConfirmation(): Promise<void> {
    await expect(this.orderConfirmationMessage).toBeVisible();
  }
}
