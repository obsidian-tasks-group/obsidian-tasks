---
layout: default
title: Sorting
nav_order: 4
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
5. `scheduled` (the date when the task is scheduled)
6. `due` (the date when the task is due)
7. `done` (the date when the task was done)
8. `path` (the path to the file that contains the task)
9. `description` (the description of the task)
10. `tag` (the description of the task)

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

## Tag sorting

> Introduced in Tasks 1.6.0.

If you want to sort by tags, by default it will sort by the first tag found in the description. If you want to sort by a tag that comes after that then you can specify the index at the end of the query. All tasks should have the same amount of tags for optimal sorting and the tags in the same order. The index starts from 1 which is also the default.

For example this query will sort by the second tag found in the description.

    ```tasks
    sort by tag 2
    ```

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
