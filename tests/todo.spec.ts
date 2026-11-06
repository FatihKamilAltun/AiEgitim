import { test, expect, type Page } from '@playwright/test';

const todoUrl = 'https://demo.playwright.dev/todomvc';

async function addTodo(page: Page, title: string) {
  const newTodo = page.getByPlaceholder('What needs to be done?');
  await newTodo.fill(title);
  await newTodo.press('Enter');
}

function todoItem(page: Page, title: string) {
  return page.locator('.todo-list li').filter({ hasText: title });
}

test.describe('TodoMVC basic operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(todoUrl);
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('adds todos and displays the remaining-item count', async ({ page }) => {
    await addTodo(page, 'Buy groceries');
    await expect(todoItem(page, 'Buy groceries')).toBeVisible();
    await expect(page.locator('.todo-count')).toHaveText('1 item left');

    await addTodo(page, 'Call the dentist');
    await expect(page.locator('.todo-list li')).toHaveText([
      'Buy groceries',
      'Call the dentist',
    ]);
    await expect(page.locator('.todo-count')).toHaveText('2 items left');
  });

  test('toggles a todo between active and completed', async ({ page }) => {
    await addTodo(page, 'Read a book');
    await addTodo(page, 'Water plants');

    const bookTodo = todoItem(page, 'Read a book');
    await bookTodo.getByRole('checkbox').check();
    await expect(bookTodo).toHaveClass(/completed/);
    await expect(todoItem(page, 'Water plants')).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toHaveText('1 item left');

    await bookTodo.getByRole('checkbox').uncheck();
    await expect(bookTodo).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toHaveText('2 items left');
  });

  test('edits a todo title', async ({ page }) => {
    await addTodo(page, 'Draft notes');

    const draftTodo = todoItem(page, 'Draft notes');
    await draftTodo.locator('label').dblclick();
    const editInput = draftTodo.locator('input.edit');
    await editInput.fill('Draft meeting notes');
    await editInput.press('Enter');

    await expect(todoItem(page, 'Draft meeting notes')).toBeVisible();
    await expect(todoItem(page, 'Draft notes')).toHaveCount(0);
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
  });

  test('filters todos by completion status', async ({ page }) => {
    await addTodo(page, 'Finish report');
    await addTodo(page, 'Send invoice');
    await todoItem(page, 'Finish report').getByRole('checkbox').check();

    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.locator('.todo-list li')).toHaveText(['Send invoice']);

    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.locator('.todo-list li')).toHaveText(['Finish report']);

    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.locator('.todo-list li')).toHaveText([
      'Finish report',
      'Send invoice',
    ]);
    await expect(todoItem(page, 'Finish report')).toHaveClass(/completed/);
    await expect(todoItem(page, 'Send invoice')).not.toHaveClass(/completed/);
  });

  test('deletes an individual todo', async ({ page }) => {
    await addTodo(page, 'Temporary task');
    await addTodo(page, 'Keep this task');

    const temporaryTodo = todoItem(page, 'Temporary task');
    await temporaryTodo.hover();
    await temporaryTodo.locator('button.destroy').click();

    await expect(todoItem(page, 'Temporary task')).toHaveCount(0);
    await expect(todoItem(page, 'Keep this task')).toBeVisible();
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
  });

  test('clears completed todos while preserving active todos', async ({ page }) => {
    await addTodo(page, 'Completed task');
    await addTodo(page, 'Active task');
    await todoItem(page, 'Completed task').getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(todoItem(page, 'Completed task')).toHaveCount(0);
    await expect(todoItem(page, 'Active task')).toBeVisible();
    await expect(page.locator('.todo-count')).toHaveText('1 item left');
  });
});