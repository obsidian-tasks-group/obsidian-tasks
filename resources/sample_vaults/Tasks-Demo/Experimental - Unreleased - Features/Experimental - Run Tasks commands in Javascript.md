# Experimental - Run Tasks commands in Javascript

## Actions

- [ ] #task Add notes to [[Experimental - Run Tasks commands in Javascript]] file, explaining it.
- [ ] #task And a statement that it is purely experimental.

## Examples when useful

- If you want to count a few thousand tasks without waiting for Tasks to freeze Obsidian whilst it renders them!

## Tasks Query block

```dataviewjs
const tasksPlugin = this.app.plugins.getPlugin("obsidian-tasks-plugin")

const query = `due before today
not done
group by path`

const groups = tasksPlugin.search(query)

dv.paragraph(`number of matches: ${groups.totalTasksCount()}`)

// Note: this gives a text-only, non-interactive representation of the found tasks.
// There is no way to complete them or edit them via this output.
let output = '';
for (const taskGroup of groups.groups) {
    for (const task of taskGroup.tasks) {
        output += task.toString()
        output += '\n';
    }
}

dv.paragraph(output)
```
