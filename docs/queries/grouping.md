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

By default Tasks displays tasks in a single list.

To divide the matching tasks up with headings, you can use the `group by` line to the query.

You can group by the following properties:

File locations:

1. `path` (the path to the file that contains the task, that is, the folder and the filename)
2. `folder` (the folder to the file that contains the task, which will be `/` for files in root of the vault)
3. `filename` (the filename of the file that contains the task, without the `.md` extension)

File contents:

1. `linktext` (the text that would be shown in the task's backlink, but with no link added)
2. `heading` (the heading preceding the task, or `(No heading)` if there are no headings in the file)

Task properties:

1. `status` (Done or Todo, which is capitalized for visibility in the headings)

You can add multiple `group by` query options, each on an extra line.
This will create nested groups.
The first group has the highest priority.

Each subsequent `group by` will generate a new heading-level within the existing grouping:

- First `group by` is displayed as `h4` headings
- Second `group by` is displayed as `h5` headings
- Third and subsequent `group by` are displayed as `h6` headings

---

## Screenshots

**TODO Change screenshot URLs to refer to main repo and branch**

Here is an example Tasks result, without any `group by` commands:

![Tasks Ungrouped](https://github.com/claremacrae/obsidian-tasks/raw/add-group-by-feature/resources/screenshots/tasks_ungrouped.png)
Tasks not grouped.

And here is what this might look like, when grouped by folder, filename and heading:

![Tasks Ungrouped](https://github.com/claremacrae/obsidian-tasks/raw/add-group-by-feature/resources/screenshots/tasks_grouped.png)
Tasks grouped.

---

## Notes

- Headings are displayed in case-sensitive alphabetical order, not the original order

---

## Examples

    ```tasks
    not done
    group by folder
    group by filename
    group by heading
    ```
