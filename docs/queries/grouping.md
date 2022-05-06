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
2. `folder` (the folder to the file that contains the task)
3. `filename` (the filename of the file that contains the task)

File contents:

1. `linktext`
2. `heading`

Task properties:

1. `status` (Done or Todo)

You can add multiple `group by` query options, each on an extra line.
The first group has the highest priority.

Each subsequent `group` will best a new heading-level within the existing grouping:

- First `group by` is displayed as `h4` headings
- Second `group by` is displayed as `h5` headings
- Third and subsequent `group by` are displayed as `h6` headings

---

## Examples

    ```tasks
    not done
    group by folder
    group by filename
    group by heading
    ```
