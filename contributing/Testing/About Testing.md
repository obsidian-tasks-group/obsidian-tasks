# Maintaining the tests

<span class="related-pages">#testing/automated-testing #testing/manual-testing</span>

This project really cares about automated testing of its source code.

It's not perfect, but it is valuable and we try to continually improve the tests.

## vitest migration

> [!warning] **vitest** test framework - adopted October 2026<!-- include: vitest-migration-snippet.md -->
> This project changed test frameworks from jest to vitest on 2026-10-01.  
> Useful links:
>
> - [[Vitest Test Framework]]
> - [[Vitest and the WebStorm IDE]]
> - The main [pull request](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/4056/changes), which shows the kinds of edits required if updating any pre-existing branches.
>
> There's no need to update any open pull requests: the Tasks team will take care of this when the tests are merged.<!-- endInclude -->

## Running automated tests

- [[Introduction to Running the tests]] - start here if you haven't run the tests before
- [[Test Coverage]]

## Writing automated tests

- [[Introduction to Writing Unit Tests]] - start here if you haven't written tests before, or are new to testing in TypeScript
- [[Vitest Test Framework]] - useful links on our chosen test framework
- [[Example Tests]] - this shows a selection of existing tests, to give ideas on writing new tests
- [[Vitest and the WebStorm IDE]] - tips if you use WebStorm
- [[Writing Tests for New or Refactored Code]] - tips if you're stuck writing tests

Testing dates and times:

- [[How do I use Moment in tests]] - how to test date and time values
- [[Simulating Dates and Times]] - examples of how to use fixed dates and times in tests
- [[Testing and Time Zones]] - how to test in different time zones (with difficulty)

Testing code that uses Obsidian API:

- [[Using Obsidian API in tests]]

More advanced features:

- [[Snapshot Tests]] - easy testing of complex string values
- [[Approval Tests]] - easy testing of complex string values and objects, collections of values, and generation of documentation snippets for [[Embedding code and data in documentation|embedding machine-generated information]] in the user docs.
- [[Integration Tests]] - capturing the Obsidian DOM, for inspecting Tasks behaviour in Reading mode.

## Manual Testing

- [[How do I test a GitHub build of the Tasks plugin]]
- [[How do I smoke-test the Tasks plugin]]
