---
layout: default
title: Styling
nav_order: 2
parent: Advanced
has_toc: false
---

# Styling Tasks

In rendered queries and Reading View, the Tasks plugin adds detailed CSS classes that represent many of each task's content, to allow for very extensive styling options via CSS.
Not only each component in a rendered task line is tagged with classes to differentiate it, many components also add classes that represent the actual content of the task, so CSS rules can refer to data such as the relative due date of a task or its specific priority.

## Basic Task Structure

{: .released }
The following description relates to a restructuring of the rendered tasks that was introduced in Tasks X.Y.Z.

The Tasks plugin renders a task in the following structure (this refers to query results, but the Reading View is the same exact the top-most containers):

```markdown
- Obsidian code block (div class="block-language-tasks")
  - Results list (ul class="plugin-tasks-query-result") OR Reading View list (ul class="contains-task-list")
    - Task (li class="task-list-item" + specific classes like "tasks-tag-atHome tasks-priority-medium tasks-due-past-1d" + data-task="[custom_status]" + data+line="[line]")
      - Task checkbox (li class="task-list-item-checkbox")
      - Task content (span class="tasks-list-text")
        - Task description and tags (span class="task-description" + tag specific classes)
          - Internal span
            - Each tag in the description is wrapped in <a href class="tag" + tag specific classes>
        - Task priority (span class="task-priority" + priority specific classes)
          - Internal span
        - Task recurrence rule (span class="task-recurring")
          - Internal span
        - Task start date (span class="task-start" + date specific classes)
          - Internal span
        - ... scheduled date, due date and done date in this order
      - Task extras (link, edit button, goto button) (span class="task-extras")
  - Tasks count (div class="tasks-count")
```

As can be seen above, the basic task `li` contains a checkbox and a content span.
The content span contains a list of **component** spans: description, priority, recurrence, start date, scheduled date, due date and done date in this order.

Each component span is marked with a **generic class**, which denotes the type of the component, and in some cases a **specific class** that represents the component's content itself.

Within each component span there is an additional "internal" span, which is the one holding the actual component text.
The reason for this additional internal span is that it allows CSS styles that closely wrap the text itself, rather than its container box, e.g. for the purpose of drawing a highlight or a box that is exactly in the size of the text.

## Generic and Specific Classes

{: .released }
Specific classes were introduced in Tasks X.Y.Z.

Each rendered task component (description, priority, recurrence rule etc) includes a **generic class** that denotes this type of component.
The generic classes are:

- `task-description`
- `task-priority`
- `task-due`
- `task-start`
- `task-scheduled`
- `task-done`
- `task-recurring`

In addition to the generic classes, there are **specific classes** that represent the content of the various task components.

A **priority specific class** represents the specific priority of a class. It can be one of the following:

- `task-priority-high`
- `task-priority-medium`
- `task-priority-low`
- `task-priority-none`

A **date specific class** represents a due, start, scheduled or done date in a format relative to the current date.
It starts with `task-due-`, `task-start-`, `task-scheduled-` or `task-done-` followed by a relative expression that denotes the number of days this field represents compared to today:

- `task-due-today` (or `task-start-today`, `task-done-today` etc) represents today.
- `task-due-future-1d` (or `task-start-future-1d`) represents 1 day in the future, i.e. tomorrow.
- `task-due-past-1d` (or `task-start-past-1d`) represents 1 day in the past, i.e. yesterday.
- These specific classes are added up to 7 days in the future or past, e.g. `task-scheduled-future-7d` or `task-due-past-7d`.
- Dates that are further than 7 days in the future or past are given a `far` postfix, e.g. `task-scheduled-future-far` or `task-due-past-far`.

A **tag specific class** translates each task tag into a CSS class, for the purpose of applying formatting according to specific tags.
It starts with `task-tag-` followed by a *sanitized* version of the tag name, which basically means that characters that are illegal to use in CSS class names are replaced by dashes.
(CSS class names allow only alphanumeric characters, a dash and an underscore.)
Examples:

- A task with the tag `#phone` will be added with the specific class `task-tag-phone`.
- A task with the tag `#t/easy` will be added with the specific class `task-tag-t-easy`.
- A task with the tag `#task/atHome` will be added the specific class `task-tag-task-atHome`.

Note that tag specific classes are also added to the tag `<a>` element within the rendered description.

Specific classes are added to both their corresponding components (e.g. to the due date component) and also to the complete task `li`, to make it easy for a CSS rule to style a complete task according to some property (e.g. color differently the complete task if it's due today, color a task according to a tag) or just one relevant component.

**Tip:** [CSS wildcard selectors](https://www.geeksforgeeks.org/wildcard-selectors-and-in-css-for-classes/) are a good way to select all past dates or future dates at once -- just use `[class*="past-"] .task-due ...` to address all overdue tasks, for example.

## Hidden Components, Groups & Short Mode

**Hidden components**, e.g. a `hide priority` line in a query, will generate the following:

- The query container (`class="plugin-tasks-query-result"`) will include a `tasks-layout-hide...` class, e.g. `tasks-layout-hide-priority`.
- Although the priority will not be rendered in the query, the upper task element (`li class="task-list-item"`) will still be added the specific class of hidden components, e.g. `task-priority-high`.

**Short mode** will add a `tasks-layout-short-mode` class to the query container.

**Grouping rules** will add `tasks-group-by...` classes to the query container, e.g. `tasks-group-by-due`.

## More Classes

The following additional components have the following classes:

| Class                          | Usage                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| plugin-tasks-query-explanation | This is applied to the PRE showing the query's explanation when the `explain` instruction is used.              |
| tasks-backlink                 | This is applied to the SPAN that wraps the backlink if displayed on the task.                                   |
| tasks-edit                     | This is applied to the SPAN that wraps the edit button/icon shown next to the task that opens the task edit UI. |
| tasks-goto                     | This is applied to the SPAN that wraps the goto button/icon shown next to the task
| tasks-urgency                  | This is applied to the SPAN that wraps the urgency score if displayed on the task.                              |
| tasks-group-heading            | This is applied to H4, H5 and H6 group headings                                                                 |

{: .released }
`tasks-group-heading` was introduced in Tasks 1.6.0.<br>
`plugin-tasks-query-explanation` was introduced in Tasks 1.19.0.
`tasks-goto` was introduced in Tasks X.Y.Z.

## Examples

The following examples can be used as [Obsidian CSS snippets](https://help.obsidian.md/How+to/Add+custom+styles#Use+Themes+and+or+CSS+snippets).

**Tip:** the following examples use CSS variables (`--var(...)`) provided by Obsidian instead of concrete color codes to maximize the chance that the result will be in-line with your chosen theme. You may of course use specific colors if so you choose.

### General Formatting

Making tags, internal links and the recurrence rules of tasks to appear in gray:

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

### Priority as a Checkbox Color

The following rules remove the Tasks priority emoticon and render the tasks' checkboxes in red, blue and orange according to the tasks' priority:

```css
.task-priority-high input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-red);
 border-color: var(--color-red);
}
.task-priority-low input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-blue);
 border-color: var(--color-blue);
}
.task-priority-medium input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-orange);
 border-color: var(--color-orange);
}
/* This part removes the regular priority emoticon */
span.task-priority {
 display: none;
}
```

### Colors for Due Today and Overdue

The following rules mark 'today' due dates as blue and past due dates as red:

```css
/* A special color for the 'due' component if it's for today */
.task-due.task-due-today span {
 background: var(--code-property);
 border-radius: 10px;
 padding: 2px 8px;
}
/* A special color for overdue due dates */
.task-due[class*="past-"] span {
 background: var(--color-pink);
 border-radius: 10px;
 padding: 2px 8px;
}
```

### Highlight for a Specific Tag

The following rule adds a green glow around `#task/atHome` tags inside the description:

```css
a.tag.task-tag-task-atHome {
    box-shadow: 0 0 5px green;
}
```

### Circle Checkboxes

The following renders checkboxes as circles instead of squares:

```css
ul > li.plugin-tasks-list-item .task-list-item-checkbox {
     margin-inline-start: 0;
  margin: 5px 2px;
  border-radius: 50%;
}
```

### Grid Layout

The following organizes the task structure into a 3-line grid, on which the description is in the first line and the various components are on the 2nd:

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
```

### Complete Example

The following can be used as a base for a full CSS snippet:

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
.task-priority-high input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-red);
 border-color: var(--color-red);
}
.task-priority-low input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-blue);
 border-color: var(--color-blue);
}
.task-priority-medium input[type=checkbox] {
 box-shadow: 0px 0px 2px 2px var(--color-orange);
 border-color: var(--color-orange);
}
/* This part removes the regular priority emoticon */
span.task-priority {
 display: none;
}

/* A special color for the 'due' component if it's for today */
.task-due.task-due-today span {
 background: var(--code-property);
 border-radius: 10px;
 padding: 2px 8px;
}
/* A special color for overdue due dates */
.task-due[class*="past-"] span {
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
```
