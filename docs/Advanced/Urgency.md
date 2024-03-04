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

Note that any invalid date values, referring to non-existent dates, are ignored.

The scores are as follows:

<!-- placeholder to force blank line before included text --><!-- include: DocsSamplesForUrgency.test.UrgencyTable_urgency-html-table.approved.md -->

<table>
<thead>
  <tr>
    <th colspan="2">Property</th>
    <th>Score</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="25">Due</td>
    <td>due more than 7 days ago</td>
    <td><code>12.00000</code></td>
  </tr>
  <tr>
    <td>due 7 days ago</td>
    <td><code>12.00000</code></td>
  </tr>
  <tr>
    <td>due 6 days ago</td>
    <td><code>11.54286</code></td>
  </tr>
  <tr>
    <td>due 5 days ago</td>
    <td><code>11.08571</code></td>
  </tr>
  <tr>
    <td>due 4 days ago</td>
    <td><code>10.62857</code></td>
  </tr>
  <tr>
    <td>due 3 days ago</td>
    <td><code>10.17143</code></td>
  </tr>
  <tr>
    <td>due 2 days ago</td>
    <td><code>9.71429</code></td>
  </tr>
  <tr>
    <td>due 1 day ago</td>
    <td><code>9.25714</code></td>
  </tr>
  <tr>
    <td>Today</td>
    <td><code>8.80000</code></td>
  </tr>
  <tr>
    <td>1 day until due</td>
    <td><code>8.34286</code></td>
  </tr>
  <tr>
    <td>2 days until due</td>
    <td><code>7.88571</code></td>
  </tr>
  <tr>
    <td>3 days until due</td>
    <td><code>7.42857</code></td>
  </tr>
  <tr>
    <td>4 days until due</td>
    <td><code>6.97143</code></td>
  </tr>
  <tr>
    <td>5 days until due</td>
    <td><code>6.51429</code></td>
  </tr>
  <tr>
    <td>6 days until due</td>
    <td><code>6.05714</code></td>
  </tr>
  <tr>
    <td>7 days until due</td>
    <td><code>5.60000</code></td>
  </tr>
  <tr>
    <td>8 days until due</td>
    <td><code>5.14286</code></td>
  </tr>
  <tr>
    <td>9 days until due</td>
    <td><code>4.68571</code></td>
  </tr>
  <tr>
    <td>10 days until due</td>
    <td><code>4.22857</code></td>
  </tr>
  <tr>
    <td>11 days until due</td>
    <td><code>3.77143</code></td>
  </tr>
  <tr>
    <td>12 days until due</td>
    <td><code>3.31429</code></td>
  </tr>
  <tr>
    <td>13 days until due</td>
    <td><code>2.85714</code></td>
  </tr>
  <tr>
    <td>14 days until due</td>
    <td><code>2.40000</code></td>
  </tr>
  <tr>
    <td>More than 14 days until due</td>
    <td><code>2.40000</code></td>
  </tr>
  <tr>
    <td>None</td>
    <td><code>0.00000</code></td>
  </tr>
  <tr>
    <td rowspan="6">Priority</td>
    <td>Highest</td>
    <td><code>9.0</code></td>
  </tr>
  <tr>
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
    <td>Lowest</td>
    <td><code>-1.8</code></td>
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
    <td rowspan="3">Start</td>
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

<!-- placeholder to force blank line after included text --><!-- endInclude -->

## Examples

```markdown
A task that is due today, has a "medium" priority, is not scheduled, and has no start date:
urgency = 8.8 + 3.9 + 0.0 + 0.0 = 12.7

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

## Limitations of the Urgency Score

### Urgency score ignores task status

If you wish to sort by status, and include tasks which may be complete, this gives misleading results, as old completed tasks will appear first.

The workaround for this is to first sort by [[Status Types|Status Type]]:

````text
```tasks
sort by status.type
sort by urgency
```
````

### Urgency score is not aware of task dependencies

When using [[Task Dependencies]], blocking tasks should have higher urgency. And blocked tasks should have lower urgency.

This is not yet implemented.

We are tracking this in [issue #2655](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2655).
