# Example Tests

<span class="related-pages">#testing/automated-testing</span>

This page shows a few examples of typical tests in the Tasks code, to give ideas on writing tests.

## An example Jest  test

Tasks tests are written with the Jest test framework.

Here is an example test:

<!-- snippet: example_basic_test -->
```ts
it('allows signifier emojis as part of the description', () => {
    // Arrange
    const line = '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20';

    // Act
    const task = fromLine({
        line,
    });

    // Assert
    expect(task).not.toBeNull();
    expect(task!.description).toEqual('this is a ✅ done task');
    expect(task!.status).toStrictEqual(Status.DONE);
    expect(task!.startDate).toBeNull();

    // Note for docs: The following are actually Tasks-specific testers...
    expect(task!.dueDate).toEqualMoment(moment('2021-09-12'));
    expect(task!.doneDate).toEqualMoment(moment('2021-06-20'));
});
```
<!-- endSnippet -->

It has:

- A name that conveys the intention of the test: `'allows signifier emojis as part of the description'`
- Some assertions, that is, statements that check that the code being executed did what was intended.
- The assertions have two parts:
  - `expect(...)` - containing a value, or function call
  - `.to....()` or `.not.to....()` - which describes the check(s) to run on the value in the `expect()` section.

## Testing filters

We have some Tasks-specific helper functions to make it easier to write expressive tests of task filters.

See [CustomMatchersForFilters.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/CustomMatchers/CustomMatchersForFilters.ts). All of its contents is automatically imported in to every test file.

The following tests of the `description regex` instruction work so conveniently because of the Tasks `toMatchTaskFromLine()` custom matcher.

<!-- snippet: example_test_of_filters -->
```ts
describe('search description for time stamps', () => {
    it('should find a time stamp in the description - simple version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /\d\d:\d\d/`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 99:99');
    });

    it('should find a time stamp in the description - more precise version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /[012][0-9]:[0-5][0-9]/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do me at 99:99');
    });
});
```
<!-- endSnippet -->

Our Jest custom matchers are all in [tests/CustomMatchers/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests/CustomMatchers).
