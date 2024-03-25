# Eisenhower Matrix

## How it works

- This uses a Dataview `dv.view()` call.
- See [the docs](https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvviewpath-input)
- It requires Dataview JavaScript Queries to be enabled in dataview settings.

The critical files are:

- `scripts/dvjs/tasks_table/view.css`
- `scripts/dvjs/tasks_table/view.js`

If you copy the above files to a different location in your vault, be sure to update the location in the `dv.view` call below.

## The code in this file

Key variables:

- `extraCommands`:
  - the Tasks instructions that will be applied to every cell
- `rows`:
  - A list of one-line filters (boolean combinations are allowed) that specify each row, for example 'Important' and 'Not Important'
- `columns`:
  - A list of one-line filters (boolean combinations are allowed) that specify each column, for example 'Urgent' and  `Not Urgent`

```dataviewjs

await dv.view(
    'scripts/dvjs/tasks_table',
    {
        extraCommands: `
# -------------------------------------------------------
not done
path does not include templates/

group by root

sort by description
sort by path

short mode

# Uncomment this line to review the searches used:
#explain
# -------------------------------------------------------
`,
        rows: [
            [
                '⏫ Important',
                '(priority is above none)'
            ],
            [
                'Not Important',
                '(priority is below medium)'
            ],
        ],
        columns: [
            [
                '📅 Urgent',
                'due before tomorrow'
            ],
            [
                '⏳ Not Urgent',
                'scheduled before tomorrow'
            ],
        ],
        codeBlockLanguage: 'tasks',
    });
```
