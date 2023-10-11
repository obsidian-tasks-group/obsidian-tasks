---
publish: true
---

# How to get all tasks in the current file

<span class="related-pages">#feature/scripting #plugin/dataview</span>

## Motivation and assumptions

When working on a note with lots of tasks, it can be useful to see a list of all the remaining tasks in the file,
for example to make sure no task gets accidentally missed.

This page documents ways of setting this up.

## Using pure Tasks blocks - with placeholders

> [!released]
> Placeholders were introduced in Tasks 4.7.0.

We want to search for tasks in the file with the same `path` that the query is in.

Tasks now provides an automated way to include the location of the `tasks` block in a query.

We can use the `path` instruction with the placeholder text `{{query.file.path}}` which will be replaced with the path of the file containing the current query, like this:

    ## Summary of Tasks within this note

    ```tasks
    not done
    path includes {{query.file.path}}
    ```

The following placeholders are available:

```text
{{query.file.path}}
{{query.file.root}}
{{query.file.folder}}
{{query.file.filename}}
```

They can be used with any text filter, not just `path`, `file`, `folder`, `filename`. For example, they might be useful with `description` and `heading` filters.

For more information, see:

- [[Placeholders]]
- [[Query Properties]]

## Using Dataview to generate Tasks blocks - the old way

<label class="ob-comment" title="" style=""> Assumptions <input type="checkbox"> <span style=""> Move this to a separate note<br> - but retain the original heading<br> - and link to it from here </span></label>:

- We assume that you know how to install and enable the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) plugin.

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

- [[Dataview]]
