import { expect, type Locator, type Page } from '@playwright/test';

export type TodoFilter = 'all' | 'active' | 'completed';

const TODO_URL = 'https://demo.playwright.dev/todomvc';

export class TodoPage {
  private readonly newTodoInput: Locator;
  private readonly todoItems: Locator;
  private readonly remainingItemCount: Locator;

  constructor(readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    const todoList = page.getByRole('list').filter({
      has: page.getByRole('checkbox', { name: 'Toggle Todo' }),
    });
    this.todoItems = todoList.getByRole('listitem');
    this.remainingItemCount = page.getByText(/^\d+ items? left$/);
  }

  async goto(url: string = TODO_URL): Promise<void> {
    await this.page.goto(url);
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async setTodoCompleted(title: string, completed: boolean = true): Promise<void> {
    const checkbox = this.getTodoItem(title).getByRole('checkbox');
    if (completed) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async filterTodos(filter: TodoFilter): Promise<void> {
    const label = filter[0].toUpperCase() + filter.slice(1);
    await this.page.getByRole('link', { name: label, exact: true }).click();
  }

  async expectRemainingItemCount(count: number): Promise<void> {
    const label = `${count} ${count === 1 ? 'item' : 'items'} left`;
    await expect(this.remainingItemCount).toHaveText(label);
  }

  async expectTodoCount(count: number): Promise<void> {
    await expect(this.todoItems).toHaveCount(count);
  }

  async expectTodoVisible(title: string, visible: boolean = true): Promise<void> {
    const todoItem = this.getTodoItem(title);
    if (visible) {
      await expect(todoItem).toBeVisible();
    } else {
      await expect(todoItem).toBeHidden();
    }
  }

  async expectTodoCompleted(title: string, completed: boolean = true): Promise<void> {
    const checkbox = this.getTodoItem(title).getByRole('checkbox');
    if (completed) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }

  private getTodoItem(title: string): Locator {
    return this.page.getByRole('listitem', { includeHidden: true }).filter({
      has: this.page.getByText(title, { exact: true }),
    });
  }
}
