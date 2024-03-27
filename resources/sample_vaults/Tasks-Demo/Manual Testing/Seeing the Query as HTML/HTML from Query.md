# HTML from Query

## Purpose

We do not yet have an automated test to invoke `QueryRenderer` and see how tasks code blocks are displayed.

This file provides a sample query, whose HTML can be copied in the Development Tools, and then version-controlled, to allow accidental changes in HTML to be detected.

It will not show any changes in event-listener code, which will still need to be manually tested.

## Next steps

The goal is to replace this with an automated test of `QueryRenderer`. This is preparation for doing that incrementally, safely.

## Instructions

### Part 1 - Full Mode

Do the following, using the tasks code block in [[#Query - Full Mode]].

1. View this file in Obsidian, in Reading mode.
1. Copy the HTML for the tasks code block:
    1. Open the Obsidian Developer Tools.
    1. Select the "Elements" tab.
    1. Click the little arrow to select an element.
        ![[HTML from Query - select an element.png|400]]
    1. Hover over the Tasks search until you see this:
        ![[HTML from Query - hover over block-language-tasks.png|400]]
    1. Then click the mouse button. It will select the `block-language-tasks` div.
        ![[HTML from Query - block-language-tasks selected.png|400]]
1. Save the HTML in `HTML from Query.html`:
    1. Right-click on the selected line and say `Copy` -> `Copy Element`.
    1. In a text editor, open up `HTML from Query.html`.
    1. Select All - in preparation for overwriting the current content.
    1. Paste
    1. Reformat
1. Review the results
    1. Unless the code has intentionally changed, the only expect difference will be the date of 'tomorrow' in the 'Postpone tooltip'.

### Part 2 - Short Mode

Repeat the above steps for the tasks code block in [[#Query - Short Mode]].

Save the HTML in `HTML from Query - short mode.html`

### Part 3 - Short Mode - Empty List

Repeat the above steps for the tasks code block in [[#Query - Short Mode - Empty List]].

Save the HTML in `HTML from Query - short mode - empty list.html`

## Task

- [ ] #task Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05 ^dcf64c

## Query - Full Mode

```tasks
path includes {{query.file.path}}
show urgency
group by due
```

## Query - Short Mode

```tasks
path includes {{query.file.path}}
show urgency
group by due
short mode
```

## Query - Short Mode - Empty List

```tasks
path includes {{query.file.path}}
show urgency
group by due
short mode
limit 0
```
