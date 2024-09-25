# ToDoListApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Reactivity targets

Feature: Sort By
Scenario: View sorting widget on the task list page
Given I am on the task list page
Then I should see the sort by date button(s)
And I should see the sort by priority button(s)

Scenario: Sort by date
Given I am on the task list page
When I click on the sort by date button(s)
Then I should see tasks sorted by date

Scenario: Sort by priority
Given I am on the task list page
When I click on the sort by priority button(s)
Then I should see tasks sorted by priority

Feature: Filter By
Scenario: View filter widget on the task list page
Given I am on the task list page
Then I should see the filter widget

Scenario: Filter by one or many fields
Given I am on the task list page
When I type in a new character in the filter widget
Then I should see tasks filtered out (it can be done by one or more fields)

Feature: Master details
Scenario: Show more button on task item
Given I am on the task list page
Then I should see the "show more" button on each item

Scenario: Show master details with task details
Given I am on the task list page
When I click on the "show more" button
Then I should see master detail with additional fields of the task

Scenario: Show live edit button on task item
Given I am on the task list page
Then I should see the "live edit" button on each item

Scenario: Show master details with task edit form
Given I am on the task list page
When I click on the "live edit" button
Then I should see master detail with edit form

Scenario: Submit master details edit form
Given I am on the task list page
And master details with task edit form is visible
When I fill out the form
And I click on the "Save" button
Then the task should be saved
And master details should disappear
And the list should be refreshed
