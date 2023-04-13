---
publish: true
---

# Columns / Properties

<span class="related-pages">#advanced/sql-search</span>

The following columns or properties are available to be used in the WHERE clauses when writing the SQL queries. The SQL engine also allows you to access the columns or properties children. For the remainder of this document the term column will be used to reference a property of the task that may or may not have sub properties you can access

## Available Columns

| Column Name              | Description                                                                         | Type                |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------- |
| status                   | The status object holds the current and next indicator and a description.           | Status Object       |
| status->symbol           | The value between the square brackets. ('x', ' ', '-', '/', etc.)                   | string              |
| status->name             | The display name for the status. ('Done', 'Todo', 'Cancelled', 'In Progress')       | string              |
| status->nextStatusSymbol | The next indicator to be used when clicked on.  ('x', ' ', '/', etc.)               | string              |
| description              | The description of the task.                                                        | string              |
| indentation              | The indentation type used like \*, -, > -. etc.                                     | string              |
| listMarker               | The list marker type, -, \* or NUMBER.                                              | string              |
| taskLocation             | Location object holds the below properties                                          | TaskLocation Object |
| taskLocation->lineNumber | Line number the task is on in the note.                                             | string              |
| precedingHeader          | The heading that precedes the task.                                                 | string              |
| path                     | Path to the note that contains the task.                                            | string              |
| filename                 | Name of the file containing the task, with the .md extension removed.               | string              |
| precedingHeader          | The heading that the task is under                                                  | string              |
| priority                 | The priority of the task. This has to be treated like a string ('1', '2', '3', '4') | string              |
| startDate                | Taken from the task string, matches `🛫 yyyy-mm-dd`. No time specified.             | Date                |
| scheduledDate            | Taken from the task string, matches `⏳ yyyy-mm-dd`. No time specified.             | Date                |
| dueDate                  | Taken from the task string, matches `📅 yyyy-mm-dd`. No time specified.             | Date                |
| createdDate              | Taken from the task string, matches `➕ yyyy-mm-dd`. No time specified.             | Date                |
| doneDate                 | Taken from the task string, matches `✅ yyyy-mm-dd`. No time specified.             | Date                |
| recurrence               | This uses logic from [jakubroztocil/rrule](https://github.com/jakubroztocil/rrule)  | Recurrence  Object  |
| blockLink                | The blockLink is a "^" annotation after the dates/recurrence rules.                 | string              |
| tags                     | This is an array of strings.                                                        | string[]            |

## Column Types

Each column type can have additional properties and actions taken if it is not just a string. These additional actions are highlighted below.

### String Types

This is the simplest type and will work as you expect for strings. As you can access JavaScript functions you can also use all the JavaScript functions alongside the SQL ones.

### Date Types

When using the date columns you can use JavaScript commands in the WHERE clause. The example below will pull all tasks that were done in 2021. To also assist in working with the date objects moment is available in your queries. For details on how to use moment please use the [Moment.js Docs](https://momentjs.com/docs/). Remember to replace the `.` with `->` if accessing a function or property.

````markdown
```tasks-sql
WHERE ((dueDate->getUTCFullYear() = 2021 AND status->symbol = 'x') OR (dueDate->getUTCFullYear() = 2022 AND status->symbol = ' ')) AND description LIKE '%#%'
```
````

Look at the [SQL Compatibility](https://github.com/AlaSQL/alasql/wiki/SQL%20keywords) table to see what SQL commands are supported.
