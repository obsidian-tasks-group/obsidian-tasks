---
layout: default
title: Frequently Asked Questions
nav_order: 1
parent: Getting Help
has_toc: false
---

# Frequently Asked Questions (FAQs)

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

## Speed or performance problems

### Tasks gets stuck at 'Loading tasks'

Occasionally users report that Tasks blocks get stuck showing 'Loading tasks' for longer than expected.

This is a known issue: [#829](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/829).

Workarounds to try:

- Close and re-open the note.
- Re-start Obsidian.

### Editing a file with a task in becomes too slow

Tasks re-displays all open Tasks blocks whenever a file is edited that has any task in.

Because Obsidian automatically saves any edits every two seconds, the closer that this re-display time gets to 2 seconds, the fewer characters can be typed in a file with tasks before the re-display happens. This can of course get very frustrating.

This is a known issue: [#697](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/697).

We do have a list of areas of the code to improve, to make this more efficient, but there remain cases where editing becomes very difficult.

Here are the main findings of research so far:

- The main effect on speed is the number of tasks displayed in tasks blocks in open files.

## Problems with search results

### My query shows `0 tasks` when it should find some tasks

Example comments:

- I know I have some tasks in this

Things to check:

### Tasks finds different numbers of tasks on different machines

Example comments:

- On my desktop machine, Tasks finds some matching tasks, and on mobile, I see `0 tasks`

Things to check:

- [#1128](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1128)

### I know this task should match this query: why is it not being found?

### How can I be sure my date filter is correct?

## Display of results

### Clicking on a backlink goes to the wrong section

- [1150](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1150)
