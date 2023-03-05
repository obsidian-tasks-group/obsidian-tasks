# Introduction to Running the tests

This note shows you how to run the Tasks automated tests on your machine, and what a test failure looks like.

## Setup

First set up your build environment: see [[Setting up build environment]].

## Running tests in your IDE

The easiest way to run your tests is in your [IDE](https://www.codecademy.com/article/what-is-an-ide).

All good IDEs will allow you to:

- Run all the tests in the current test file
- Run a single test that you are working on
- Execute the tests inside a [debugger](https://code.visualstudio.com/docs/editor/debugging), which is really valuable to understand failing tests.
- Jump straight to the location of the test failure

Users of JetBrains WebStorm should review [[Jest and the WebStorm IDE]].

## Running tests in a terminal window

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

## A failing test

When a test fails, we get lots of useful information in the output.

In the example below, we see:

- It points us the the line of the failing test (132 below):
- Which tells us that the task's status was supposed to be `TODO`
- Looking up:
  - the lines beginning with  a hyphen (`-`) show what the status *should* have been,
  - the lines beginning with a plus sign (`+`) who what the status actually was, in this test run.

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

## Next: Writing Tests

Next, the page [[Introduction to Writing Unit Tests]] will talk you through writing tests.
