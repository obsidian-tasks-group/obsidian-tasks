# Introduction to Writing Unit Tests

Once you have got the tests [[Introduction to Running the tests|running on your machine]], this page aims to help you get started writing new tests.

## Why bother with tests?

Unit tests are extra source files that run small parts of the Tasks source code, and confirm that the behaviour is correct.

We write them so that we can be:

1. reasonably confident that new code does what it is intended to do
2. able to detect unwanted changes (bugs!) before releasing the Tasks plugin to user.

## Location of the tests

The test source files are in all the `*.test.ts` files in the [tests/](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/tests) directory.

There are some sub-folders there, to try and keep the number of files manageable.

(You can ignore all the `.md` and `.txt` files with names beginning `DocsSamples`.)

## Getting started writing tests

### Introduction to Jest

We use the [[About Testing#Jest test framework|Jest test framework]] for writing our tests.

This looks like a good introduction to writing tests using Jest: [Jest Tutorial for Beginners: Getting Started With JavaScript Testing](https://www.valentinog.com/blog/jest/#test-structure-and-a-first-failing-test).

### First find the test file to modify

Suppose you are modifying the file [src/Query/DateParser.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Query/DateParser.ts).

You would look for a file called DateParser.test.ts, which you would find in [tests/Query/DateParser.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/Query/DateParser.test.ts).

We try to keep the folder structures aligned in `src/` and `tests/`, although this is not perfect.

### Then review the existing tests

Generally, by reading and experimenting with existing tests, you will likely see how to add new tests.

## Tips for writing tests

- Never trust your test until you have seen it fail
  - It makes sure you are actually running the correct test
  - And it shows you how useful the output will be if the test fails in future. If it fails, would you know what the intended behaviour is?

## Getting help writing tests

If you need help with writing tests, start a [Development Discussion](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/development)  on Discord, and we will help you out.
