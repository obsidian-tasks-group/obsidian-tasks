---
publish: true
---

# Vitest Test Framework

<span class="related-pages">#testing/automated-testing</span>

The tests use the [Vitest](https://vitest.dev) test framework.

The [Expect](https://vitest.dev/api/expect) page is a good reference for the many Vitest
testing features.

Our [vitest.config.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/vitest.config.ts)
enables `globals: true`, so tests can use `describe`, `it`, `expect`, the test hooks, and `vi`
without importing them. It also sets the `jsdom` environment for every unit test.

See [[Introduction to Running the tests]] for commands and [[Integration Tests]] for the
separate configuration used by tests in `integration_tests/`.
