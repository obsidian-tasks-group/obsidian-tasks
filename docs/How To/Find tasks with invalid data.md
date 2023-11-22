---
publish: true
---

# Find tasks with potentially invalid data

## Motivation

For performance reasons, Tasks is stricter in reading data from markdown lines that some users expect.

As a precaution, it can be useful to check the data in your vault periodically, to see if there any tasks with seemingly valid data that is not found by Tasks.

## Find tasks with potentially missed emoji signifiers

### Example emoji problem

In the following task, there is unrecognised text after the due and done dates.

```text
 - [x] check 📅 2022-12-29 ✅ 2023-01-09 > appointment 19.1.
```

Tasks sees as an un-dated task with the text description:

`check 📅 2022-12-29 ✅ 2023-01-09 > appointment 19.1.`

### Finding unread emojis

The following tasks block lists any tasks that have emoji in the description, which usually means data that has not been interpreted by Tasks. This is typically because there is some text other than emoji signifiers and tags at the end of the line.

<!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

````text
```tasks
# These description instructions need to be all on one line:
(description includes ⏫ ) OR (description includes 🔼 ) OR (description includes 🔽 ) OR (description includes 📅 ) OR (description includes ⏳ ) OR (description includes 🛫 ) OR (description includes ✅ ) OR (description includes 🔁 )

# Optionally, uncomment this line and exclude your templates location
# path does not include _templates

group by path
```
````

The errors can be fixed by editing the Task and moving any text that appears after the unparsed values to earlier in the line.

## Find tasks with invalid dates

### Example date problem

This task has an illegal due date:

```text
- [ ] Do stuff 📅  2023-12-32
```

### Finding problem dates

The following tasks block lists any tasks with invalid dates, meaning data that has potentially not been interpreted by Tasks.

<!-- NEW_QUERY_INSTRUCTION_EDIT_REQUIRED if the new query is for a new date field -->

````text
```tasks
(done date is invalid) OR (due date is invalid) OR (scheduled date is invalid) OR (start date is invalid)

# Optionally, uncomment this line and exclude your templates location
# path does not include _templates

group by path
```
````

Errors with invalid dates are not easily fixed using the [[Create or edit Task|‘Create or edit Task’ Modal]], as it shows any invalid dates with placeholder text, instead of showing the original values.

So to fix any found tasks, use the [[Backlinks|backlink]] to navigate to the original line and fix the error there.

## Invalid recurrence rules

There is not currently a way to find any tasks with invalid recurrence rules.

## More Information

Relevant documentation sections:

- [[Getting Started#Limitations and warnings|Limitations and warnings parsing tasks]]
- [[Filters#Finding Tasks with Invalid Dates|Finding Tasks with Invalid Dates]].
