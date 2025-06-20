<!-- placeholder to force blank line before included text -->

| Name | Instruction(s) |
| ----- | ----- |
| `daily_note_overdue` | `# Tasks that should have been done before this day.`<br>`# This preset requires a YYYY-MM-DD file name.`<br>`not done`<br>`happens before {{query.file.filenameWithoutExtension}}`<br>`group by function task.happens.format('YYYY-MM')` |
| `daily_note_do_this_day` | `# Tasks that should be done this day.`<br>`# This preset requires a YYYY-MM-DD file name.`<br>`not done`<br>`happens {{query.file.filenameWithoutExtension}}` |
| `daily_note_done_this_day` | `# Tasks that have been done this day.`<br>`# This preset requires a YYYY-MM-DD file name.`<br>`done`<br>`done {{query.file.filenameWithoutExtension}}` |


<!-- placeholder to force blank line after included text -->
