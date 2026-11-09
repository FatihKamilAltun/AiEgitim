import { test } from '@playwright/test';
import { TodoPage } from '../../src/pages/TodoPage';

test.describe('Todo list management', () => {
  test('adds three todos, completes the second, and filters by status', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const firstTodo = 'Prepare presentation';
    const secondTodo = 'Review slides';
    const thirdTodo = 'Send meeting invite';

    await todoPage.goto();
    await todoPage.expectTodoCount(0);

    await todoPage.addTodo(firstTodo);
    await todoPage.addTodo(secondTodo);
    await todoPage.addTodo(thirdTodo);
    await todoPage.expectTodoCount(3);
    await todoPage.expectRemainingItemCount(3);

    await todoPage.setTodoCompleted(secondTodo);
    await todoPage.expectTodoCompleted(secondTodo);
    await todoPage.expectTodoCompleted(firstTodo, false);
    await todoPage.expectTodoCompleted(thirdTodo, false);
    await todoPage.expectRemainingItemCount(2);

    await todoPage.filterTodos('active');
    await todoPage.expectTodoCount(2);
    await todoPage.expectTodoVisible(firstTodo);
    await todoPage.expectTodoVisible(secondTodo, false);
    await todoPage.expectTodoVisible(thirdTodo);
    await todoPage.expectRemainingItemCount(2);

    await todoPage.filterTodos('completed');
    await todoPage.expectTodoCount(1);
    await todoPage.expectTodoVisible(firstTodo, false);
    await todoPage.expectTodoVisible(secondTodo);
    await todoPage.expectTodoVisible(thirdTodo, false);
    await todoPage.expectRemainingItemCount(2);
  });
});
