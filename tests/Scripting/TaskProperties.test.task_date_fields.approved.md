<!-- placeholder to force blank line before included text -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.due` | `TasksDate` | `2023-07-04 00:00` | `TasksDate` | `` |
| `task.due.moment` | `Moment` | `moment('2023-07-04 00:00')` | `null` | `null` |
| `task.due.formatAsDate()` | `string` | `'2023-07-04'` | `string` | `''` |
| `task.due.formatAsDate('undated')` | `string` | `'2023-07-04'` | `string` | `'undated'` |
| `task.due.formatAsDateAndTime()` | `string` | `'2023-07-04 00:00'` | `string` | `''` |
| `task.due.formatAsDate('undated')` | `string` | `'2023-07-04'` | `string` | `'undated'` |
| `task.due.format('dddd')` | `string` | `'Tuesday'` | `string` | `''` |
| `task.due.toISOString()` | `string` | `'2023-07-04T00:00:00.000Z'` | `string` | `''` |
| `task.due.toISOString(true)` | `string` | `'2023-07-04T00:00:00.000+00:00'` | `string` | `''` |
| `task.due.category.name` | `string` | `'Future'` | `string` | `'Undated'` |
| `task.due.category.sortOrder` | `number` | `3` | `number` | `4` |
| `task.due.category.groupText` | `string` | `'%%3%% Future'` | `string` | `'%%4%% Undated'` |
| `task.due.fromNow.name` | `string` | `'in 22 days'` | `string` | `''` |
| `task.due.fromNow.sortOrder` | `number` | `320230704` | `number` | `0` |
| `task.due.fromNow.groupText` | `string` | `'%%320230704%% in 22 days'` | `string` | `''` |


<!-- placeholder to force blank line after included text -->
