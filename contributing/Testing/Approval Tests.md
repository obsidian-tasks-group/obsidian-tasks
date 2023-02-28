# Approval Tests

There is a brief overview of Approval tests at [approvaltests.com](https://approvaltests.com).

For including complex text in the documentation, some tests here will
soon start using the [Approval Tests implementation in NodeJS](https://github.com/approvals/Approvals.NodeJS).

If these tests fail, they will currently try and launch [diffmerge](https://sourcegear.com/diffmerge/) to show
the differences between received and approved files.

## Summary of Approval Tests

Approval tests typically call a function beginning `verify`, and pass
in some text or an object to be tested.

## Example Approval tests

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
