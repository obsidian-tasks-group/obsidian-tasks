---
layout: default
title: Sorting
nav_order: 2
parent: Queries
---

# Sorting
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

---

## Basics

By default Tasks sorts tasks by [a calculated score we call "urgency"]({{ site.baseurl }}{% link advanced/urgency.md %}).

To sort the results of a query different from the default, you must add at least one `sort by` line to the query.

You can sort tasks by the following properties:

1. `urgency` ([urgency]({{ site.baseurl }}{% link advanced/urgency.md %}))
2. `status` (done or todo)
3. `priority` (priority of the task; "low" is below "none")
4. `start` (the date when the task starts)
2. `scheduled` (the date when the task is scheduled)
2. `due` (the date when the task is due)
5. `done` (the date when the task was done)
6. `path` (the path to the file that contains the task)
7. `description` (the description of the task)

You can add multiple `sort by` query options, each on an extra line.
The first sort has the highest priority.
Each subsequent `sort` will sort within the existing sorting.

<div class="code-example" markdown="1">
Info
{: .label .label-blue }
If you want tasks to be sorted the way they were sorted before urgency was introduced,
add the following `sort` expressions to your queries:

    ```tasks
    sort by status
    sort by due
    sort by path
    ```

---

Info
{: .label .label-blue }
Sorting by description should take into account `[[Links]]` and `[Links with an|Alias]` (note pipe).
It should also take into account `*italics*` and `==highlights==`.
It sorts by the text that's visible in preview mode.
</div>

## Reverse sorting

After the name of the property that you want to sort by, you can add the `reverse` keyword.
If given, the sort order will be reverse for that property.

Note that `reverse` will reverse the entire result set.
For example, when you `sort by done reverse` and your query results contain tasks that do not have a done date, then those tasks without a done date will be listed first.

---

## Examples

    ```tasks
    not done
    due today
    sort by due
    ```

    ```tasks
    done
    sort by done reverse
    ```

    ```tasks
    not done
    due before next monday
    sort by status
    sort by description reverse
    sort by path
    ```
