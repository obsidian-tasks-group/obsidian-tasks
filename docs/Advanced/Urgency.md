---
publish: true
---

# Urgency

## Introduction

By default, Tasks [[Sorting|sorts]] query results by decreasing urgency.
Tasks tries to calculate urgency based on what you should likely work on next.

The urgency score isn't perfect, of course, as many more factors may influence the order on which you want to work on tasks.
Urgency can only consider the parameters it knows: [[Dates|dates]] and [[Priority|priorities]].
It is likely that the task you want to work on next is one of the tasks at the top of the list.

The idea of Tasks' urgency is based on [Taskwarrior's](https://taskwarrior.org/) concept of [urgency](https://taskwarrior.org/docs/urgency.html).

## How Urgency is Calculated

Urgency is a numeric score that Tasks calculates for each task.
Tasks simply sums up urgency scores of different aspects of a task:

1. Due date
1. Priority
1. Scheduled date
1. Start date

As you can tell from the table below, **due dates have the strongest influence on urgency.**

The scores are as follows:

<table>
<thead>
  <tr>
    <th colspan="2">Property</th>
    <th>Score</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="5">Due</td>
    <td>More than 7 days overdue</td>
    <td><code>12.0</code></td>
  </tr>
  <tr>
    <td rowspan="2">Due between 7 days ago and in 14 days</td>
    <td>Range of <code>12.0</code> to <code>0.2</code></td>
  </tr>
  <tr>
    <td>Example for "today": <code>9.0</code></td>
  </tr>
  <tr>
    <td>More than 14 days until due</td>
    <td><code>0.2</code></td>
  </tr>
  <tr>
    <td>None</td>
    <td><code>0.0</code></td>
  </tr>
  <tr>
    <td rowspan="4">Priority</td>
    <td>High</td>
    <td><code>6.0</code></td>
  </tr>
  <tr>
    <td>Medium</td>
    <td><code>3.9</code></td>
  </tr>
  <tr>
    <td>None</td>
    <td><code>1.95</code></td>
  </tr>
  <tr>
    <td>Low</td>
    <td><code>0.0</code></td>
  </tr>
  <tr>
    <td rowspan="3">Scheduled</td>
    <td>Today or earlier</td>
    <td><code>5.0</code></td>
  </tr>
  <tr>
    <td>Tomorrow or later</td>
    <td><code>0.0</code></td>
  </tr>
  <tr>
    <td>None</td>
    <td><code>0.0</code></td>
  </tr>
  <tr>
    <td rowspan="3">Starts</td>
    <td>Today or earlier</td>
    <td><code>0.0</code></td>
  </tr>
  <tr>
    <td>Tomorrow or later</td>
    <td><code>-3.0</code></td>
  </tr>
  <tr>
    <td>None</td>
    <td><code>0.0</code></td>
  </tr>
</tbody>
</table>

## Examples

```markdown
A task that is due today, has a "medium" priority, is not scheduled, and has no start date:
urgency = 9.0 + 3.9 + 0.0 + 0.0 = 12.9

A task that has no due date, a "high" priority, is scheduled for yesterday, and started yesterday:
urgency = 0.0 + 6.0 + 5.0 + 0.0 = 11.0

A task that has no due date, a "high" priority, is scheduled for tomorrow, and starts tomorrow:
urgency = 0.0 + 6.0 + 0.0 - 3.0 = 3.0
```

## How to Display the Urgency Score

You can display the calculated Urgency score in your task list using the `show urgency` option.

## Common Questions

### Why do all my tasks have urgency score 1.95?

We sometimes get told that the urgency score is broken and Tasks is ignoring the user's Due Date, Priority and so on.

Invariably this is because the user's Tasks data is incorrect in some way that prevents the Tasks plugin from reading the data.

And the most likely current cause of that is incorrectly ordered values in a task: see [[Auto-Suggest#What do I need to know about the order of items in a task?|What do I need to know about the order of items in a task?]].

We are tracking this ordering limitation in [issue #1505](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1505).
