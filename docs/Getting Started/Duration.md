---
publish: true
---

# Duration

Tasks can have an optional estimated duration — how long you expect the task to take.

## Duration Format

Duration values use a compact format combining hours and minutes:

- `1h30m` — 1 hour and 30 minutes
- `2h` — 2 hours (whole hours, no minutes)
- `45m` — 45 minutes (less than one hour)

Duration values are **normalised** when saved: excess minutes are carried into hours.
For example, `90m` is stored and displayed as `1h30m`.

To add a duration to a task, append the ⏱ symbol followed by the duration value:

```markdown
- [ ] Write unit tests ⏱ 1h30m
- [ ] Quick review ⏱ 15m
- [ ] Team meeting ⏱ 2h
```

## Adding and Editing Duration

Instead of typing the emoji manually, you can use the **Create or edit Task** modal or **Intelligent Auto-Suggest**.

### Create or Edit Task Modal

Use the `Tasks: Create or edit` command to open the [[Create or edit Task|'Create or edit Task' Modal]].
The Duration field accepts the same compact format (`1h30m`, `2h`, `45m`).
Invalid formats are highlighted in red as you type, and a preview shows the normalised value.

### Auto-Suggest

[[Auto-Suggest|Intelligent Auto-Suggest]] provides common duration values when you type the ⏱ symbol.
Start typing a duration value, or leave it empty, to see suggestions such as `15m`, `30m`, `45m`, `1h`, `1h30m`, `2h`, `3h`, `4h`.

## Related Tasks Block Instructions

The following instructions use the duration field in tasks:

### Filtering

- `has duration` — matches any task with a duration set
- `no duration` — matches tasks without a duration
- `duration is <value>` — matches tasks with an exact duration
- `duration above <value>` — matches tasks with more than the specified duration
- `duration below <value>` — matches tasks with less than the specified duration

Comparisons are done by total minutes, so `90m` and `1h30m` are treated as equal.

See [[Filters#Duration|Filters: Duration]] for full documentation.

### Sorting

- `sort by duration`
- `sort by duration reverse`

Tasks with no duration sort after tasks with a duration.

See [[Sorting#Duration|Sorting: Duration]] for full documentation.

### Grouping

- `group by duration`
- `group by duration reverse`
  - Tasks are grouped by their duration value (e.g. `1h30m`, `45m`).
  - Tasks with no duration are grouped as `No duration`.

See [[Grouping#Duration|Grouping: Duration]] for full documentation.

### Display

- `hide duration` — hides the duration field from rendered task lines
- `show duration` — shows the duration field in rendered task lines

See [[Layout|Layout]] for full documentation.

## Scripting

Duration is accessible as [[Task Properties#Values for Other Task Properties|task properties]]:

- `task.duration` — the `Duration` object (use `.toText()` for the canonical string, e.g. `'1h30m'`)
- `task.durationHours` — the hours component as a number, or `null` if no duration is set
- `task.durationMinutes` — the minutes component as a number, or `null` if no duration is set
