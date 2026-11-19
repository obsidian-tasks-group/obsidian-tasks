# DataviewJS - tasks in folder

<!-- begin-snippet: queryTasks-dataviewjs -->

```dataviewjs
const tasksApi = app.plugins.plugins['obsidian-tasks-plugin']?.apiV1;
if (!tasksApi) {
    dv.paragraph("Tasks plugin API is not available.");
} else {
    // Pass dv.current().file.path as queryPath to support file placeholders and properties
    const currentPath = dv.current().file.path;
    const tasks = tasksApi.queryTasks(`
        not done
        path includes {{query.file.folder}}
        sort by due
        limit 10
    `, currentPath);

    dv.header(3, `Tasks in folder (${tasks.length})`);
    // queryTasks returns Tasks objects, not Dataview tasks, so display them with dv.list() rather than dv.taskList()
    dv.list(tasks.map(t => `${t.description} (due: ${t.due.formatAsDate('none')})`));
}
```

<!-- end-snippet -->

<!-- Current output:

TODO paste the rendered output here after running this in Obsidian

-->
