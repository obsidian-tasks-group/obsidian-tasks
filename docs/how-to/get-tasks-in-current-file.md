---
layout: default
title: How to get tasks in current file
nav_order: 2
parent: How Tos
---

# How to get all tasks in the current file

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

## Motivation and assumptions

When working on a note with lots of tasks, it can be useful to see a list of all the remaining tasks in the file,
for example to make sure no task gets accidentally missed.

This page documents ways of setting this up.

Assumptions:

- We assume that you know how to install and enable the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin.

## Using pure Tasks blocks - fragile and error-prone

Tasks does not provide an automated way to include the location of the `tasks` block in a query.

It is possible to use the `path` instruction, but unfortunately you have to insert the path to the file yourself:

    ## Summary of Tasks within this note

    ```tasks
    not done
    path includes [insert current note's name or full path]
    ```

For example:

    ## Summary of Tasks within this note

    ```tasks
    not done
    path includes Obsidian/tasks/tasks user support/03 Done - tasks user support/1.11.0 release
    ```

<div class="code-example" markdown="1">

Warning
{: .label .label-yellow}

Using `path includes` to search for a particular file name or folder is error-prone, as if you rename the file,
you have to remember to manually update the location in the tasks block, and this is very error-prone.
</div>

## Using Dataview to generate Tasks blocks - safe and convenient

There is a nice property that the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin can write out code blocks that are then processed by other plugins.

This means that we can use Dataview to generate a standard Tasks code block, so that features like recurrence all work fine,
and we make Dataview fill in the file name for us automatically.

### Sample code - and how to use it

1. Ensure that Dataview is installed in your Obsidian vault, and is enabled.
1. Copy the entire following sample code block to your clipboard.
1. Open an obsidian note that has some incomplete tasks.
1. Paste the text in to Obsidian **without formatting** (`Shift+Ctrl+V` or `Shift+Command+V`).
1. Switch to either Live Preview or Reading modes, to see the remaining tasks.

Sample code block:

    ## Summary of Tasks within this note

    ```dataviewjs
    const query = `
    not done
    path includes ${dv.current().file.path}
    # you can add any number of extra Tasks instructions, for example:
    group by heading
    `;

    dv.paragraph('```tasks\n' + query + '\n```');
    ```

### Using the example

- There are a lot of punctuation and special characters in that code, which are easy to get wrong if you re-type the code.
- Therefore, we strongly recommend that you copy-and-paste-without-formatting the code sample in to your note, and then modify the query instructions to suit your needs.

### How the code works

- The sample code block above  is a `dataviewjs` code block, which generates a Tasks code block!
- By putting a backtick character (``` ` ```) at both ends of the `query` value, we can create a multi-line string, and we can embed values inside that string using `${...}`.
  - To find out more about this JavaScript technique, see [Template literals (Template strings)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
- The Dataview magic bit is the use of `dv.current().file.path`, which gives the path of the file containing code block.
- The line `dv.paragraph('```tasks\n' + query + '\n```');`:
  - turns our query in to a tasks block, by adding the first and last lines (each with 3 backticks)
  - and then writes out the full tasks block as a paragraph.
- When viewed in either Live Preview or Reading mode, Tasks just works!

### Viewing the generated tasks instructions

Changing the last line to create a `text` block instead of a `tasks` one will show the raw tasks instructions generated, which can be useful if you want to see what Dataview has generated:

    dv.paragraph('```text\n' + query + '\n```');

### Putting it in to a callout, for prettier output

If you would like a more pleasing appearance for your Tasks results, you can put them in a [callout](https://help.obsidian.md/How+to/Use+callouts). In the example below, the results are displayed in a callout of type `todo`:

    ## Summary of Tasks within this note

    ```dataviewjs
    function callout(text, type) {
        const allText = `> [!${type}]\n` + text;
        const lines = allText.split('\n');
        return lines.join('\n> ') + '\n'
    }

    const query = `
    not done
    path includes ${dv.current().file.path}
    # you can add any number of extra Tasks instructions, for example:
    group by heading
    `;

    dv.paragraph(callout('```tasks\n' + query + '\n```', 'todo'));
    ```

## Related pages

- [Dataview]({{ site.baseurl }}{% link other-plugins/dataview.md %})
