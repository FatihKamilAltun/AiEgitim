import type { Locator, Page } from '@playwright/test';

export type PriceSortOrder = 'low-to-high' | 'high-to-low';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';

export class InventoryPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly productSortDropdown: Locator;
  private readonly productCartButtons: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.productSortDropdown = page.getByRole('combobox');
    this.productCartButtons = page.getByRole('button', {
      name: /^(Add to cart|Remove)$/,
    });
  }

  async goto(url: string = SAUCEDEMO_URL): Promise<void> {
    await this.page.goto(url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async sortProductsByPrice(order: PriceSortOrder = 'low-to-high'): Promise<void> {
    const optionLabel =
      order === 'low-to-high' ? 'Price (low to high)' : 'Price (high to low)';
    await this.productSortDropdown.selectOption({ label: optionLabel });
  }

  async addProductToCart(index: number): Promise<void> {
    if (!Number.isInteger(index) || index < 0) {
      throw new RangeError('Product index must be a non-negative integer.');
    }

    await this.productCartButtons.nth(index).click();
  }
}
