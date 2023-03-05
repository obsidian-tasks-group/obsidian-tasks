# Introduction to running and writing Unit Tests

## Why bother with tests?

Unit tests are extra source files that run small parts of the Tasks source code, and confirm that the behaviour is correct.

We write them so that we can detect unwanted changes in behaviour (bugs!) before releasing the Tasks plugin to user.

## Running the tests on your machine

### Setup

First set up your build environment: see [[Setting up build environment]].

### In your IDE

The easiest way to run your tests is in your [IDE](https://www.codecademy.com/article/what-is-an-ide).

All good IDEs will allow you to:

- Run all the tests in the current test file
- Run a single test that you are working on
- Execute the tests inside a [debugger](https://code.visualstudio.com/docs/editor/debugging), which is really valuable to understand failing tests.
- Jump straight to the location of the test failure

Users of JetBrains WebStorm should review [[Jest and the WebStorm IDE]].

### In a terminal window

You can also run all the tests, to confirm your environment is set up correctly:

```bash
yarn test
```

Or you can run a subset of the tests, which saves time if you are working on a particular area of the code:

```bash
yarn test Task.test.ts
yarn test tests/Query/Filter/DueDateField.test.ts
yarn test tests/Query/Filter/
```

## Some example Jest tests

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
    expect(task!.dueDate).not.toBeNull();
    expect(task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD'))).toStrictEqual(true);
    expect(task!.doneDate).not.toBeNull();
    expect(task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD'))).toStrictEqual(true);
});
```
<!-- endSnippet -->

It has:

- A name that conveys the intention of the test: `'allows signifier emojis as part of the description'`
- Some assertions, that is, statements that check that the code being executed did what was intended.
- The assertions have two parts:
  - `expect(...)` - containing a value, or function call
  - `.to....()` or `.not.to....()` - which describes the check(s) to run on the value in the `expect()` section.

## Seeing a test fail

We can see a test fail by changing the test on `task.status`so that it is expecting TODO instead of DONE. This is the difference:

```diff
-    expect(task!.status).toStrictEqual(Status.DONE);
+    expect(task!.status).toStrictEqual(Status.TODO);
```

When we run the tests again, we see it points us the the line of the failing test (132 below):

```text
  ● parsing › allows signifier emojis as part of the description

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 4
    + Received  + 4

      Status {
        "configuration": StatusConfiguration {
          "availableAsCommand": true,
    -     "name": "Todo",
    -     "nextStatusSymbol": "x",
    -     "symbol": " ",
    -     "type": "TODO",
    +     "name": "Done",
    +     "nextStatusSymbol": " ",
    +     "symbol": "x",
    +     "type": "DONE",
        },
      }

      130 |         expect(task).not.toBeNull();
      131 |         expect(task!.description).toEqual('this is a ✅ done task');
    > 132 |         expect(task!.status).toStrictEqual(Status.TODO);
          |                              ^
      133 |         expect(task!.dueDate).not.toBeNull();
      134 |         expect(task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD'))).toStrictEqual(true);
      135 |         expect(task!.doneDate).not.toBeNull();

      at Object.<anonymous> (tests/Task.test.ts:132:30)
```

## Basic guidelines for
