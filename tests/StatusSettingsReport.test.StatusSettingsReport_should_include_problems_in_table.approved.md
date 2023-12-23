| Status Symbol | Next Status Symbol | Status Name | Status Type | Problems (if any) |
| ----- | ----- | ----- | ----- | ----- |
| `space` | `x` | Todo | `TODO` |  |
| `x` | `space` | Done | `DONE` |  |
| `/` | `x` | In Progress | `IN_PROGRESS` |  |
| `/` | `x` | In Progress DUPLICATE | `IN_PROGRESS` | Duplicate symbol '`/`': this status will be ignored. |
| `X` | `space` | X - conventionally DONE, but this is CANCELLED | `CANCELLED` | For information, the conventional type for status symbol `X` is `DONE`: you may wish to review this type. |
|  |  |  | `TODO` | Empty symbol: this status will be ignored. |
| `p` | `q` | Unknown next symbol | `TODO` | Next symbol `q` is unknown: create a status with symbol `q`. |
| `c` | `d` | Followed by d | `TODO` | Next symbol `d` is unknown: create a status with symbol `d`. |
| `n` | `n` | Non-task | `NON_TASK` |  |
| `1` | `space` | DONE followed by TODO | `DONE` |  |
| `2` | `/` | DONE followed by IN_PROGRESS | `DONE` |  |
| `3` | `x` | DONE followed by DONE | `DONE` | This `DONE` status is followed by `DONE`, not `TODO` or `IN_PROGRESS`.<br>If used to complete a recurring task, it will instead be followed by `TODO` or `IN_PROGRESS`, to ensure the next task matches the `not done` filter.<br>See [Recurring Tasks and Custom Statuses](https://publish.obsidian.md/tasks/Getting+Started/Statuses/Recurring+Tasks+and+Custom+Statuses). |
| `4` | `X` | DONE followed by CANCELLED | `DONE` | This `DONE` status is followed by `CANCELLED`, not `TODO` or `IN_PROGRESS`.<br>If used to complete a recurring task, it will instead be followed by `TODO` or `IN_PROGRESS`, to ensure the next task matches the `not done` filter.<br>See [Recurring Tasks and Custom Statuses](https://publish.obsidian.md/tasks/Getting+Started/Statuses/Recurring+Tasks+and+Custom+Statuses). |
| `5` | `n` | DONE followed by NON_TASK | `DONE` | This `DONE` status is followed by `NON_TASK`, not `TODO` or `IN_PROGRESS`.<br>If used to complete a recurring task, it will instead be followed by `TODO` or `IN_PROGRESS`, to ensure the next task matches the `not done` filter.<br>See [Recurring Tasks and Custom Statuses](https://publish.obsidian.md/tasks/Getting+Started/Statuses/Recurring+Tasks+and+Custom+Statuses). |
