<!-- placeholder to force blank line before included text -->


```javascript
group by function '``' + task.originalMarkdown + '``'
```

- Group by the raw text of the task's original line in the MarkDown file as code.
- Note the pairs of backtick characters ('`'), to preserve even single backtick characters in the task line.
- It's important to prevent the task checkbox (for example, '[ ]') from being rendered in the heading, as it gets very confusing if there are checkboxes on both headings and tasks.

```javascript
group by function task.originalMarkdown.replace(/^[^\[\]]+\[.\] */, '')
```

- An alternative to formatting the markdown line as code is to remove everything up to the end of the checkbox.
- Then render the rest of the task line as normal markdown.


<!-- placeholder to force blank line after included text -->
