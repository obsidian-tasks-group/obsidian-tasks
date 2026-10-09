---
publish: true
aliases:
  - Testing/Jest Test Framework
---

# Vitest Test Framework

<span class="related-pages">#testing/automated-testing</span>

> [!warning] **vitest** test framework - adopted October 2026<!-- include: vitest-migration-snippet.md -->
> This project changed test frameworks from jest to vitest on 2026-10-01.  
> Useful links:
>
> - [[Vitest Test Framework]]
> - [[Vitest and the WebStorm IDE]]
> - The main [pull request](https://github.com/obsidian-tasks-group/obsidian-tasks/pull/4056/changes), which shows the kinds of edits required if updating any pre-existing branches.
>
> There's no need to update any open pull requests: the Tasks team will take care of this when the tests are merged.<!-- endInclude -->

The tests use the [Vitest](https://vitest.dev) test framework.

The [Expect](https://vitest.dev/api/expect) page is a good reference for the many Vitest
testing features.

Our [vitest.config.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/vitest.config.ts)
enables `globals: true`, so tests can use `describe`, `it`, `expect`, the test hooks, and `vi`
without importing them. It also sets the `jsdom` environment for every unit test.

See [[Introduction to Running the tests]] for commands and [[Integration Tests]] for the
separate configuration used by tests in `integration_tests/`.
