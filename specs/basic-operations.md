# TodoMVC Basic Operations Test Plan

## Application Overview

Target: https://demo.playwright.dev/todomvc

Focused browser test plan for the core user-visible TodoMVC operations: adding and editing todos, changing completion state, filtering, deleting, and clearing completed items. Each test is independent and begins with an empty list.

## Test Scenarios

### 1. Basic Todo Operations

#### 1.1. Add todos and display the remaining-item count

**Steps:**
  1. Start on the TodoMVC page with an empty list. Enter "Buy groceries" in the new-todo input and press Enter.
    - expect: A todo item labeled "Buy groceries" appears in the list.
    - expect: The remaining-item count shows 1 item left.
  2. Enter "Call the dentist" in the new-todo input and press Enter.
    - expect: Both todos appear in the list in the order entered.
    - expect: The remaining-item count shows 2 items left.

#### 1.2. Toggle a todo between active and completed

**Steps:**
  1. Start with an empty list. Add "Read a book" and "Water plants".
    - expect: Both todos are visible and active.
    - expect: The remaining-item count shows 2 items left.
  2. Mark "Read a book" complete using its completion control.
    - expect: "Read a book" is visibly marked completed.
    - expect: "Water plants" remains active.
    - expect: The remaining-item count shows 1 item left.
  3. Mark "Read a book" active again.
    - expect: Both todos are active.
    - expect: The remaining-item count shows 2 items left.

#### 1.3. Edit a todo title

**Steps:**
  1. Start with an empty list and add "Draft notes".
    - expect: The todo appears with the title "Draft notes".
  2. Double-click the todo title, replace it with "Draft meeting notes", and press Enter.
    - expect: The todo displays "Draft meeting notes".
    - expect: The old title is no longer shown.
    - expect: The todo remains active and the remaining-item count stays at 1 item left.

#### 1.4. Filter todos by completion status

**Steps:**
  1. Start with an empty list. Add "Finish report" and "Send invoice", then mark "Finish report" completed.
    - expect: Both todos are present; "Finish report" is completed and "Send invoice" is active.
    - expect: The remaining-item count shows 1 item left.
  2. Select the Active filter.
    - expect: Only "Send invoice" is shown.
  3. Select the Completed filter.
    - expect: Only "Finish report" is shown.
  4. Select the All filter.
    - expect: Both todos are shown with their completion states preserved.

#### 1.5. Delete an individual todo

**Steps:**
  1. Start with an empty list. Add "Temporary task" and "Keep this task".
    - expect: Both todos are visible and active.
    - expect: The remaining-item count shows 2 items left.
  2. Reveal and activate the delete control for "Temporary task".
    - expect: "Temporary task" is removed from the list.
    - expect: "Keep this task" remains visible and active.
    - expect: The remaining-item count shows 1 item left.

#### 1.6. Clear completed todos while preserving active todos

**Steps:**
  1. Start with an empty list. Add "Completed task" and "Active task", then mark "Completed task" completed.
    - expect: "Completed task" is completed and "Active task" remains active.
    - expect: The remaining-item count shows 1 item left.
  2. Activate the Clear completed control.
    - expect: The completed todo is removed.
    - expect: The active todo remains visible.
    - expect: The remaining-item count remains 1 item left.
