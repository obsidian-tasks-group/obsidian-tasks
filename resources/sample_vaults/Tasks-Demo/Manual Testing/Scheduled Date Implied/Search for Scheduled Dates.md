# Search for Scheduled Dates

Look at the backlinks on the tasks, to see their filenames, to understand the behaviour.

None of these tasks has any ⏳ scheduled date value.

```tasks
folder includes {{query.file.folder}}
group by function task.scheduled.moment ? '✅ Has scheduled date from filename' : '❌ No scheduled date from filename'
group by scheduled
```
