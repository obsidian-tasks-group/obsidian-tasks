---
publish: true
---

# Testing in different Time Zones

<span class="related-pages">#testing/automated-testing #testing/manual-testing</span>

## Fixing the time zone to UTC in Jest

Currently, our Jest tests fix the time zone at run-time to `UTC` in [tests/global-setup.js](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/tests/global-setup.js).

This was done to ensure that the tests pass for contributors all around the world, regardless of their own time zone.

## Why we don't use 'moment-timezone'

... in `src/`:

1. Obsidian plugins are instructed to use `moment` as supplied by Obsidian, to reduce plugin size.
1. `moment-timezone` increases the Tasks plugin `main.js` size 10-fold, which would slow down start-up time.
1. So we can't use `moment-timezone` in the released plugin.

... in `tests/`:

1. The only way to set the timezone dynamically in tests is to use [moment-timezone](https://momentjs.com/timezone/docs/).
1. But `moment-timezone` modifies the behaviour of `moment`
1. Which would invalidate any of tests of behaviour that uses `moment`: we could not be confident that the code would behave the same in the released plugin as it does in tests.

## Manually testing in different time zones

In the absence of automated testing of Tasks in different time zones, see this manual test in the 'Tasks-Demo' vault:

- [Tasks-Demo/Manual Testing/Time Zones/Pacific-Auckland.md](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/resources/sample_vaults/Tasks-Demo/Manual%20Testing/Time%20Zones/Pacific-Auckland.md).
