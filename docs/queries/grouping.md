---
layout: default
title: Grouping
nav_order: 3
parent: Queries
---

# Grouping
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

By default, Tasks displays tasks in a single list.

To divide the matching tasks up with headings, you can add `group by` lines to the query.

### Available grouping properties

You can group by the following properties:

File locations:

1. `path` (the path to the file that contains the task, that is, the folder and the filename)
1. `folder` (the folder to the file that contains the task, which will be `/` for files in root of the vault)
1. `filename` (the filename of the file that contains the task, without the `.md` extension)
    *  Note that tasks from different notes with the same file name will be grouped together in the same group.

File contents:

1. `backlink` (the text that would be shown in the task's backlink, combining the task's file name and heading, but with no link added)
1. `heading` (the heading preceding the task, or `(No heading)` if there are no headings in the file)

Task properties:

1. `status` (Done or Todo, which is capitalized for visibility in the headings)
    * Note that the Done group is displayed before the Todo group,
      which differs from the Sorting ordering of this property.

### Multiple groups

You can add multiple `group by` query options, each on an extra line.
This will create nested groups.
The first group has the highest priority.

Each subsequent `group by` will generate a new heading-level within the existing grouping:

- First `group by` is displayed as `h4` headings
- Second `group by` is displayed as `h5` headings
- Third and subsequent `group by` are displayed as `h6` headings

See the [screenshots below](#screenshots) for how this looks in practice.

<div class="code-example" markdown="1">
Info
{: .label .label-blue }
Headings are displayed in case-sensitive alphabetical order, not the original order.

---

Info
{: .label .label-blue }
The order of operations ensures that grouping does not modify which tasks are displayed, for example when the `limit` option is used:

1. all the filter instructions are run
1. then any sorting instructions are run
1. then any `limit` instructions are run
1. then finally any grouping instructions are run

</div>


---

## Screenshots

### Before

Here is an example Tasks result, without any `group by` commands:

![Tasks Ungrouped](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/tasks_ungrouped.png)
Tasks not grouped.

### After

And here is what this might look like, when grouped by folder, filename and heading:

![Tasks Grouped](https://github.com/schemar/obsidian-tasks/raw/main/resources/screenshots/tasks_grouped.png)
Tasks grouped.

---

## Examples

    ```tasks
    not done
    group by folder
    group by filename
    group by heading
    ```
