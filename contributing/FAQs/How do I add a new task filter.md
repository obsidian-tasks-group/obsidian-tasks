# How do I add a new task filter?

All the following steps would be done in the same branch, for inclusion in the same pull request.

## Update src/

- Implement the search filter:
  - Add to  [src/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/src/Query/Filter) a  new class that inherits [Field](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
  - Typically, this can be done by inheriting one of the partial implementations:
    - [DateField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/DateField.ts)
    - [TextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/TextField.ts)
    - [MultiTextField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/MultiTextField.ts)
    - [FilterInstructionsBasedField.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/Filter/FilterInstructionsBasedField.ts)
- Add the new class to [src/Query/FilterParser.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/FilterParser.ts)

## Update tests/

Write tests as you go.

Ideally, write a failing test first, and then implement the minimum code for the failing test to pass.

For help on writing and running the tests, see [[About Testing]]

- Add to [tests/Query/Filter](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/Query/Filter) a new test file.
  - This should focus on testing whether or not individual Task objects, with carefully selected sample date, match the filter.
  - Think about edge cases.
- Add the new instruction(s) to  'Query parsing' test in  [tests/Query.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query.test.ts)
  - This verifies that the new filter instruction has been correctly wired in to the Query class.

## Update doc/

It can be worth writing the documentation first, to ensure that you can explain the new feature clearly before implementing it.

For help on editing the documentation, see [[About Documentation]]

- Document the new instruction(s) in [docs/queries/filters.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/queries/filters.md)
  - Add the placeholder to indicate which version the feature will be released in: see [[Version numbers in documentation]]
- Add the new instruction(s) to [docs/quick-reference/index.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/docs/quick-reference/index.md)

## Examples Pull Requests

- [#1098](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1098) feat: Add filename filter
  - This shows adding a brand new Field class, so shows all the steps above.
- [#1228](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1228) feat: Add 4 instructions: '(done|due|date|start) date is invalid'
  - This adds several new instructions via the DateField class, which implements most of the date-based filters.
  - It was sufficient to add tests of the new feature in just one of the instructions implemented via DateField.
  - It also shows adding a file to the sample vault, to demonstrate and test the new feature.
