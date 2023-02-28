# Maintaining the tests

The tests use the [ts-jest](https://www.npmjs.com/package/ts-jest) wrapper around the
[jest](https://jestjs.io) test framework.

The [Expect](https://jestjs.io/docs/expect) page is a good reference for the many jest testing features.

## Writing Tests for New or Refactored Code

### Think of it as testing user-visible features

- Tests that test low-level implementation details are hard to maintain over time. Instead, test user-visible features.
- Try to think of the purpose of the code that has missing tests.
  - For example, in `taskFromLine()` in [src/Commands/CreateOrEdit.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Commands/CreateOrEdit.ts) the comments are quite useful in terms of showing the different scenarios being considered. Something like:
        _already a task line with a global filter, already a task line missing the global filter, already a task line and there is no global filter, already a bullet item, not in a bullet item_
  - These then would be good tests to write: specifically, tests to check that each of those scenarios does actually behave as expected.
  - And if the implementation changed in future, those tests would be extremely useful to the maintainer at the time.
  - And if a new behaviour was added in future, it would be obvious how to add a new test for it.

### Location of code

Often, untested code is in locations that you can't call in tests (for example, because it uses some Obsidian code).
All that needs to be done then is to refactor - via 'move method' or 'extract method') the code out to a different source file.
For more about refactoring safely and easily, see the talk [Refactoring Superpowers: Make Your IDE Do Your Work, Faster and More Safely](https://www.youtube.com/watch?v=BX6gh2xNiuU).

### Then start writing tests

If you struggle to name a Jest `it` test, think in terms of _should_: for example, _should convert a line with no bullet to ..._

## Snapshot Tests

For testing more complex objects, some of the tests here use Jest's
[Snapshot Testing](https://jestjs.io/docs/snapshot-testing) facility, which is similar to
[Approval Tests](https://approvaltests.com) but easier to use in JavaScript.

For readability of snapshots, we favour [Inline Snapshots](https://jestjs.io/docs/snapshot-testing#inline-snapshots),
which are saved in the source code. See that documentation for how to easily update the inline
snapshot, if the output is intended to be changed.

## Approval Tests

There is a brief overview of Approval tests at [approvaltests.com](https://approvaltests.com).

For including complex text in the documentation, some tests here will
soon start using the [Approval Tests implementation in NodeJS](https://github.com/approvals/Approvals.NodeJS).

If these tests fail, they will currently try and launch [diffmerge](https://sourcegear.com/diffmerge/) to show
the differences between received and approved files.

### Summary of Approval Tests

Approval tests typically call a function beginning `verify`, and pass
in some text or an object to be tested.

### Example Approval tests

Example test in [tests/TestingTools/ApprovalTestsDemo.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/ApprovalTestsDemo.test.ts), that saves its input in a text file:

<!-- snippet: approval-test-as-text -->
```ts
test('SimpleVerify', () => {
    verify('Hello From Approvals');
});
```
<!-- endSnippet -->

The corresponding `approved` file, named [tests/TestingTools/ApprovalTestsDemo.test.ApprovalTests_SimpleVerify.approved.txt](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/ApprovalTestsDemo.test.ApprovalTests_SimpleVerify.approved.txt):

<!-- snippet: ApprovalTestsDemo.test.ApprovalTests_SimpleVerify.approved.txt -->
```txt
Hello From Approvals
```
<!-- endSnippet -->

<!-- snippet: approval-test-as-json -->
```ts
test('JsonVerify', () => {
    const data = { name: 'fred', age: 30 };
    verifyAsJson(data);
});
```
<!-- endSnippet -->

The corresponding `approved` file, named [tests/TestingTools/ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json):

<!-- snippet: ApprovalTestsDemo.test.ApprovalTests_JsonVerify.approved.json -->
```json
{
  "name": "fred",
  "age": 30
}
```
<!-- endSnippet -->

## Jest and the WebStorm IDE

The WebStorm IDE has a [helpful page](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html)
on how it makes testing with jest easy.

Note in particular the
[Snapshot testing section](https://www.jetbrains.com/help/webstorm/running-unit-tests-on-jest.html#ws_jest_snapshot_testing)
for how to view the diffs in the event of snapshot test failures, and also how to update the saved snapshot
of one or all snapshot failures.

## Test Coverage

`yarn run jest --coverage` will generate a coverage report in the `coverage` directory, which is ignored by this project's [.gitignore](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/.gitignore).
Your IDE may also be able to show you the test coverage of a source file.
Adding tests where possible - see [[#Location of code]] for constraints to code not currently covered by the automated tests is a great way to contribute!
