---
layout: default
title: Styling
nav_order: 2
parent: Advanced
has_toc: false
---

# Styling Tasks
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

## Introduction

{: .released }
Almost all the features below were introduced in Tasks 3.0.0.

In rendered queries and Reading View, the Tasks plugin adds detailed CSS classes and data attributes that represent many of each task's content, to allow for very extensive styling options via CSS.
Not only each component in a rendered task line is tagged with classes to differentiate it, many components also add classes and data attributes that represent the actual content of the task, so CSS rules can refer to data such as the relative due date of a task or its specific priority.

### Please share your styles online

We invite Tasks users who create their own Obsidian CSS snippets to share them in the ["Show and tell" Discussions category](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/show-and-tell) - to inspire others and allow them to use and learn from your CSS and design skills.

Thank you in advance!

### Backwards compatibility and CSS snippets

{: .warning }
If you find any existing Tasks CSS snippets stopped working with Tasks 3.0.0, follow the advice in
[Appendix: Fixing CSS pre-existing snippets for Tasks 3.0.0]({{ site.baseurl }}{% link advanced/styling.md %}#appendix-fixing-css-pre-existing-snippets-for-tasks-300) below.

## Basic Task Structure

{: .released }
The following description relates to a restructuring of the rendered tasks that was introduced in Tasks 3.0.0.

The Tasks plugin renders a task in the following structure (this refers to query results, but the Reading View is the same except the top-most containers):

```markdown
- Obsidian code block (div class="block-language-tasks")
  - Results list (ul class="plugin-tasks-query-result") OR Reading View list (ul class="contains-task-list")
    - Task (li class="task-list-item" + attributes like data-task-priority="medium" data-task-due="past-1d" + data-task="[custom_status]" + data-line="[line]")
      - Task checkbox (li class="task-list-item-checkbox")
      - Task content (span class="tasks-list-text")
        - Task description and tags (span class="task-description")
          - Internal span
            - Each tag in the description is wrapped in <a href class="tag" data-tag-name="[tag-name]">
        - Task priority (span class="task-priority" + data-task-priority attribute)
          - Internal span
        - Task recurrence rule (span class="task-recurring")
          - Internal span
        - Task created date (span class="task-created" + data-task-created attribute)
          - Internal span
        - ... start date, scheduled date, due date and done date in this order
      - Task extras (link, edit button) (span class="task-extras")
  - Tasks count (div class="tasks-count")
```

As can be seen above, the basic task `li` contains a checkbox and a content span.
The content span contains a list of **component** spans: description, priority, recurrence, created date, start date, scheduled date, due date and done date in this order.

Each component span is marked with a **generic class**, which denotes the type of the component, and in some cases a **data attribute** that represents the component's content itself.

Within each component span there is an additional "internal" span, which is the one holding the actual component text.
The reason for this additional internal span is that it allows CSS styles that closely wrap the text itself, rather than its container box, e.g. for the purpose of drawing a highlight or a box that is exactly in the size of the text.

## Generic Classes and Data Attributes

{: .released }
Data attributes were introduced in Tasks 3.0.0.

Each rendered task component (description, priority, recurrence rule etc) includes a **generic class** that denotes this type of component.
The generic classes are:

- `task-description`
- `task-priority`
- `task-due`
- `task-created`
- `task-start`
- `task-scheduled`
- `task-done`
- `task-recurring`

In addition to the generic classes, there are [**data attributes**](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) that represent the content of the various task components.

A **priority data attributes** named `data-task-priority` represents the specific priority of a class. It can be `high`, `medium`, `low` or `normal`.
The `normal` value is special: it is added as a default to a task's upper `task-list-item` even if there is no priority field set for that task.

A **date attribute** represents a due, created, start, scheduled or done date in a format relative to the current date.
The date attributes are `data-task-due`, `data-task-created`, `data-task-start`, `data-task-scheduled` and `data-task-done` and are populated with a relative expression that denotes the number of days this field represents compared to today:

- `data-task-due="today"` (or `data-task-start="today"`, `data-task-start="today"` etc) represents today.
- `data-task-due="future-1d"` (or `data-task-start="future-1d"`) represents 1 day in the future, i.e. tomorrow.
- `data-task-due="past-1d"` (or `data-task-start="past-1d"`) represents 1 day in the past, i.e. yesterday.
- These attributes are added up to 7 days in the future or past, e.g. `data-task-scheduled="future-7d"` or `data-task-due="past-7d"`.
- Dates that are further than 7 days in the future or past are given a `far` postfix, e.g. `data-task-scheduled="future-far"` or `data-task-due="past-far"`.

A **tag data attribute** repeats each tag's content as a data attribute, for the purpose of applying formatting according to specific tags.
The tag `<a>` elements are added a `data-tag-name` attribute with a *sanitized* version of the tag name, which basically means that characters that are illegal to use in HTML attributes (e.g. `&`, `"`) are replaced with dashes.

Data attributes are added to both their corresponding components (e.g. to the due date component) and also to the complete task `li`, to make it easy for a CSS rule to style a complete task according to some property (e.g. color differently the complete task if it's due today, color a task according to a tag) or just one relevant component.

An exception is the tag data attribute which is added only to the tag's `<a>` element within the rendered description -- however you can still use a CSS `:has` selector to format an entire task's description according to a tag, as demonstrated in the examples below.

{: .warning }
The CSS `:has` selector is available with Obsidian installer version 1.1.9 and newer. You can run the Obsidian command `Show debug info` to see your current installer version.

**Tip:** [CSS wildcard selectors](https://www.geeksforgeeks.org/wildcard-selectors-and-in-css-for-classes/) are a good way to select all past dates or future dates at once -- just use `.task-due[data-task-due^="past-"]` to address all overdue tasks, for example. Examples that utilize this can be found below.

## Hidden Components, Groups & Short Mode

**Hidden components**, e.g. a `hide priority` line in a query, will generate the following:

- The query container (`class="plugin-tasks-query-result"`) will include a `tasks-layout-hide...` class, e.g. `tasks-layout-hide-priority`.
- Although the priority will not be rendered in the query, the upper task element (`li class="task-list-item"`) will still be added the attribute of hidden components, e.g. `data-task-priority="high"`.

**Short mode** will add a `tasks-layout-short-mode` class to the query container.

**Grouping rules** will add a `data-task-group-by` attribute to the query container, e.g. `data-task-group-by="due,scheduled"`.

## Custom Statuses

Task statuses are represented by a few data attributes, all set on the `task-list-item` `LI` element:

- `data-task` contains the *status symbol*, e.g. "" for a regular TODO, "x" for a regular DONE, or any other symbols that you use.
- `data-task-status-type` contains the *status type*, e.g. "TODO", "DONE", "IN_PROGRESS".
- `data-task-status-name` contains the *status name*, e.g. "Todo", "Done", "In Progress".

These attributes can be used to style tasks according to their status, with the status type being the preferred selector in most cases.

## Limitations of styling

- The CSS classes and data attributes described here are **not available for markdown in Source and Live Preview modes**.
- Specifically. the CSS classes described here are applied to:
  - Reading mode,
  - Tasks query blocks in Reading and Live Preview modes.
- Styles **cannot access any automatic scheduled date** that is created if the [Use Filename as Default Date]({{ site.baseurl }}{% link getting-started/use-filename-as-default-date.md %})  option is enabled.

## More Classes

The following additional components have the following classes:

| Class                          | Usage                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| plugin-tasks-query-explanation | This is applied to the PRE showing the query's explanation when the `explain` instruction is used.              |
| tasks-backlink                 | This is applied to the SPAN that wraps the backlink if displayed on the task.                                   |
| tasks-edit                     | This is applied to the SPAN that wraps the edit button/icon shown next to the task that opens the task edit UI. |
| tasks-urgency                  | This is applied to the SPAN that wraps the urgency score if displayed on the task.                              |
| tasks-group-heading            | This is applied to H4, H5 and H6 group headings                                                                 |

{: .released }
`tasks-group-heading` was introduced in Tasks 1.6.0.<br>
`plugin-tasks-query-explanation` was introduced in Tasks 1.19.0.

## CSS Examples

### About these examples

The following examples can be used as [Obsidian CSS snippets](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets).

**Tip:** the following examples use CSS variables (`--var(...)`) provided by Obsidian instead of concrete color codes to maximize the chance that the result will be in-line with your chosen theme. You may of course use specific colors if so you choose.

{: .warning }
> These examples are provided only for explanation: we make no claims that these examples are useful, good design, or perfect CSS!
>
> They are provided purely to demonstrate use of the CSS selectors provided by the Tasks plugin.

#### More examples available online

We are inviting Tasks users who create their own Obsidian CSS snippets to share them with others in the ["Show and tell" Discussions category](https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/categories/show-and-tell).

Once the Tasks 3.0.0 release has been out few a few days, we expect there to be a growing number of snippets to be available at the above link.

Feel free to add your own too!

### General Formatting

Making tags, internal links and the recurrence rules of tasks to appear in gray:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-tags-links-recurrence-gray.css -->
```css
.tasks-list-text a.tag {
    color: var(--list-marker-color);
}

.tasks-backlink a.internal-link {
    color: var(--list-marker-color);
}

.task-recurring {
    color: var(--list-marker-color);
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-tags-links-recurrence-gray.css snippet](../../images/tasks-plugin-tags-links-recurrence-gray-snippet.png)

### Priority as a Checkbox Color

The following rules remove the Tasks priority emoticon and render the tasks' checkboxes in red, orange, blue and cyan according to the tasks' priority:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-priority-as-checkbox-color.css -->
```css
.task-list-item[data-task-priority="high"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-red);
    border-color: var(--color-red);
}

.task-list-item[data-task-priority="medium"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-orange);
    border-color: var(--color-orange);
}

.task-list-item[data-task-priority="normal"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-blue);
    border-color: var(--color-blue);
}

.task-list-item[data-task-priority="low"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-cyan);
    border-color: var(--color-cyan);
}

/* This part removes the regular priority emoticon */
span.task-priority {
    display: none;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-priority-as-checkbox-color.css snippet](../../images/tasks-plugin-priority-as-checkbox-color-snippet.png)

### Styling Tasks with Custom Statuses

#### Status Symbols

To create a green halo around the checkbox of tasks with a `/` status symbol, add the following CSS snippet:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-style-status-symbols.css -->
```css
li.task-list-item[data-task="/"] .task-list-item-checkbox {
    box-shadow: 0 0 10px green !important;
}
```
<!-- endSnippet -->

For example, in Reading mode:

![Example of tasks-plugin-style-status-symbols.css snippet](../../images/tasks-plugin-style-status-symbols-snippet.png)

This screenshot was taken with the Prism theme selected, to style the checkboxes. The `!important` [flag](https://developer.mozilla.org/en-US/docs/Web/CSS/important) is needed to override the theme's opinion about shadows.

#### Status Types

Alternatively, you can use the status type to write rules that are independent of the status symbol.
Here, we put a green halo around all actionable tasks:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-style-status-types.css -->
```css
li.task-list-item[data-task-status-type="TODO"] .task-list-item-checkbox,
li.task-list-item[data-task-status-type="IN_PROGRESS"] .task-list-item-checkbox {
    box-shadow: 0 0 10px green !important;
}
```
<!-- endSnippet -->

For example, in Reading mode:

![Example of tasks-plugin-style-status-types.css snippet](../../images/tasks-plugin-style-status-types-snippet.png)

Again, the screenshot was taken with the Prism theme and the `!important` [flag](https://developer.mozilla.org/en-US/docs/Web/CSS/important) is needed to override the theme's opinion about shadows.

### Colors for Due Today and Overdue

The following rules mark 'today' due dates as cyan and past due dates as red:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-color-due-today-and-overdue.css -->
```css
/* A special color for the 'due' component if it's for today */
.task-list-item[data-task-status-type="TODO"] .task-due[data-task-due="today"] span,
.task-list-item[data-task-status-type="IN_PROGRESS"] .task-due[data-task-due="today"] span {
    background: var(--color-cyan);
    border-radius: 10px;
    padding: 2px 8px;
}

/* A special color for overdue due dates */
.task-list-item[data-task-status-type="TODO"] .task-due[data-task-due^="past-"] span,
.task-list-item[data-task-status-type="IN_PROGRESS"] .task-due[data-task-due^="past-"] span {
    background: var(--color-pink);
    border-radius: 10px;
    padding: 2px 8px;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-color-due-today-and-overdue.css snippet](../../images/tasks-plugin-color-due-today-and-overdue-snippet.png)

Note that we only include the status type in the selector, to avoid highlighting dates in tasks with DONE, CANCELLED and NON_TASK status types.

### Highlight for a Specific Tag

The following rule adds a green glow around `#task/atHome` tags inside the description:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-highlight-specific-tag-green-glow.css -->
```css
a.tag[data-tag-name="#task/atHome"] {
    box-shadow: 0 0 5px green;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-highlight-specific-tag-green-glow.css snippet](../../images/tasks-plugin-highlight-specific-tag-green-glow-snippet.png)

The following rule adds a rounded red background to the description of a task if it contains the tag `#task/strategic`:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-highlight-specific-tag-round-red-description.css -->
```css
.task-description span:has(.tag[data-tag-name="#task/strategic"]) {
    background: #ffbfcc;
    border-radius: 10px;
    padding: 2px 8px;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-highlight-specific-tag-round-red-description.css snippet](../../images/tasks-plugin-highlight-specific-tag-round-red-description-snippet.png)

### Circle Checkboxes

The following renders checkboxes as circles instead of squares:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-circular-checkboxes.css -->
```css
ul > li.plugin-tasks-list-item .task-list-item-checkbox {
    margin-inline-start: 0;
    margin: 5px 2px;
    border-radius: 50%;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-circular-checkboxes.css snippet](../../images/tasks-plugin-circular-checkboxes-snippet.png)

### Grid Layout

The following organizes the task structure into a 3-line grid, on which:

- the description is in the first line,
- and the various components are on the second,
- the urgency, backlink and edit button are, if displayed, on the third.

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-grid-layout.css -->
```css
ul > li.plugin-tasks-list-item {
    grid-template-columns: 25px auto;
    display: grid;
    align-items: top;
}

span.task-description {
    grid-row: 1;
    grid-column: 1/10;
}

span.tasks-backlink {
    grid-row: 2;
    grid-column: 2;
    font-size: small;
}

span.task-recurring {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

span.task-due {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

span.task-done {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

.tasks-list-text {
    position: relative;
    display: inline-grid;
    width: max-content;
    grid-column-gap: 10px;
}

span.task-extras {
    grid-row: 2;
    grid-column: 2;
    font-size: small;
}

/* Make sure nested bullets in Reading mode get the whole width of the grid */
li.task-list-item ul.has-list-bullet {
 grid-row: 3;
 grid-column: 1/10;
}
```
<!-- endSnippet -->

For example, in Reading view:

![Example of tasks-plugin-grid-layout.css snippet in Reading view](../../images/tasks-plugin-grid-layout-snippet-reading.png)

And in a Tasks query block:

![Example of tasks-plugin-grid-layout.css snippet in Tasks query block](../../images/tasks-plugin-grid-layout-snippet-query.png)

### Complete Example

The following can be used as a base for a full CSS snippet:

<!-- snippet: resources/sample_vaults/Tasks-Demo/.obsidian/snippets/tasks-plugin-complete-example.css -->
```css
/* I like tags to appear in gray so they won't grab too much attention */
.tasks-list-text a.tag {
    color: var(--list-marker-color);
}

/* Set internal links to gray too instead of Obsidian's default */
.tasks-backlink a.internal-link {
    color: var(--list-marker-color);
}

/* Paint the recurrence rule in gray so it will be less distracting */
.task-recurring {
    color: var(--list-marker-color);
}

/* List indentation values that seem to work well for me */
ul.contains-task-list.plugin-tasks-query-result {
    padding: 0 10px;
}

/* This seems to be needed for the task description to word-wrap correctly if they're too long */
span.tasks-list-text {
    width: auto;
}

/* Represent tasks' priority with colorful round checkboxes instead of the priority emoticons */
.task-list-item[data-task-priority="high"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-red);
    border-color: var(--color-red);
}

.task-list-item[data-task-priority="medium"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-orange);
    border-color: var(--color-orange);
}

.task-list-item[data-task-priority="normal"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-blue);
    border-color: var(--color-blue);
}

.task-list-item[data-task-priority="low"] input[type=checkbox] {
    box-shadow: 0px 0px 2px 2px var(--color-cyan);
    border-color: var(--color-cyan);
}

/* This part removes the regular priority emoticon */
span.task-priority {
    display: none;
}

/* A special color for the 'due' component if it's for today, and still needs work on */
.task-list-item[data-task-status-type="TODO"] .task-due[data-task-due="today"] span,
.task-list-item[data-task-status-type="IN_PROGRESS"] .task-due[data-task-due="today"] span {
    background: var(--color-cyan);
    border-radius: 10px;
    padding: 2px 8px;
}

/* A special color for overdue due dates, for tasks that still need work on */
.task-list-item[data-task-status-type="TODO"] .task-due[data-task-due^="past-"] span,
.task-list-item[data-task-status-type="IN_PROGRESS"] .task-due[data-task-due^="past-"] span {
    background: var(--color-pink);
    border-radius: 10px;
    padding: 2px 8px;
}

/* Make checkboxes a circle instead of a square */
ul > li.plugin-tasks-list-item .task-list-item-checkbox {
    margin-inline-start: 0;
    margin: 5px 2px;
    border-radius: 50%;
}

/* The following section organizes the task components in a grid, so the description will be on the first row
 * of each item and most components will be in the 2nd row. */
ul > li.plugin-tasks-list-item {
    grid-template-columns: 25px auto;
    display: grid;
    align-items: top;
}

span.task-description {
    grid-row: 1;
    grid-column: 1/10;
}

span.tasks-backlink {
    grid-row: 2;
    grid-column: 2;
    font-size: small;
}

span.task-recurring {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

span.task-due {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

span.task-done {
    grid-row: 2;
    font-size: small;
    width: max-content;
}

.tasks-list-text {
    position: relative;
    display: inline-grid;
    width: max-content;
    grid-column-gap: 10px;
}

span.task-extras {
    grid-row: 2;
    grid-column: 2;
    font-size: small;
}

/* Make sure nested bullets in Reading mode get the whole width of the grid */
li.task-list-item ul.has-list-bullet {
 grid-row: 3;
 grid-column: 1/10;
}
```
<!-- endSnippet -->

For example:

![Example of tasks-plugin-complete-example.css snippet](../../images/tasks-plugin-complete-example-snippet.png)

---

## Appendix: Fixing CSS pre-existing snippets for Tasks 3.0.0

This sections explains what to do if any CSS snippets for Tasks stopped working after updating to 3.0.0.

### Summary

Try removing any `>` from your CSS selectors, as shown in this before-and-after `diff` output:

```diff
- li.plugin-tasks-list-item > span.tasks-backlink > a {
+ li.plugin-tasks-list-item   span.tasks-backlink > a {
```

### Explanation

The major CSS improvements documented above resulted in a tiny breaking change to the CSS classes generated by Tasks to display query blocks.

The `>` in the `diff` output above means 'direct child', whereas the space means 'general child'.

Since Tasks 3.0.0, the `tasks-backlink` span is now inside another span (`tasks-extras`) and not directly below `plugin-tasks-list-item`.

So if you find that any CSS blocks for Tasks stopped working in Tasks 3.0.0, check for any `>` and change them to spaces.
