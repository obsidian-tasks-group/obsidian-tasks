---
publish: true
---

# Testing in different Time Zones

<span class="related-pages">#testing/automated-testing #testing/manual-testing</span>

## Fixing the time zone to UTC in Vitest

Currently, our Vitest tests fix the time zone at run-time to `UTC` in [tests/global-setup.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/global-setup.js).

This was done to ensure that the tests pass for contributors all around the world, regardless of their own time zone.

## Running individual tests in another time zone

Individual tests can temporarily run in a different time zone, using `withTimezone()` from [tests/TestingTools/DateTestHelpers.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/DateTestHelpers.ts).

The time zone is an [IANA time zone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), such as `America/New_York` or `Pacific/Auckland`.

```ts
it('should format the same instant differently in New York', () => {
    withTimezone('America/New_York', () => {
        // 12:00 UTC is 07:00 in New York in winter:
        expect(window.moment('2026-01-15T12:00:00Z').format('HH:mm')).toBe('07:00');
    });
});
```

Things to know:

- It sets `process.env.TZ` for the duration of the callback, and restores the previous value afterwards, even if the callback throws.
- The callback must be synchronous: `process.env.TZ` is restored as soon as the callback returns. TypeScript will reject passing an `async` function.
- Create dates in these tests with `window.moment()`: see [[How do I use Moment in tests#Moment or Date]].
- This works because [vitest.config.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/vitest.config.ts) uses `pool: 'vmForks'`. Node.js does not allow `process.env.TZ` to be changed inside `worker_threads`, which is what the `vmThreads` pool uses.
- For examples, see the tests in [tests/TestingTools/DateTestHelpers.test.ts](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/TestingTools/DateTestHelpers.test.ts), including one showing that `02:30` does not exist on the spring-forward day in `America/New_York`.

## Why we don't use 'moment-timezone'

... in `src/`:

1. Obsidian plugins are instructed to use `moment` as supplied by Obsidian, to reduce plugin size.
1. `moment-timezone` increases the Tasks plugin `main.js` size 10-fold, which would slow down start-up time.
1. So we can't use `moment-timezone` in the released plugin.

... in `tests/`:

1. `moment-timezone` would be one way to set the timezone dynamically in tests. (We use `withTimezone()` instead - see above.)
1. But `moment-timezone` modifies the behaviour of `moment`
1. Which would invalidate any of tests of behaviour that uses `moment`: we could not be confident that the code would behave the same in the released plugin as it does in tests.

## Manually testing in different time zones

In addition to the automated tests above, see this manual test in the 'Tasks-Demo' vault:

- [Tasks-Demo/Manual Testing/Time Zones/Pacific-Auckland.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Manual%20Testing/Time%20Zones/Pacific-Auckland.md).
