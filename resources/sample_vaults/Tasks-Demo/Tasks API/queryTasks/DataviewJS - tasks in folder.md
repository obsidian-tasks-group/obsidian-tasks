# DataviewJS - tasks in folder

- [ ] #task Sample task in file 'DataviewJS - tasks in folder'

<!-- begin-snippet: queryTasks-dataviewjs -->

```dataviewjs
const tasksApi = app.plugins.plugins['obsidian-tasks-plugin']?.apiV1;
if (!tasksApi) {
    dv.paragraph("Tasks plugin API is not available.");
    return;
}

// Pass dv.current().file.path as queryPath to support file placeholders and properties
const currentPath = dv.current().file.path;
const tasks = tasksApi.queryTasks(`
    not done
    path includes {{query.file.folder}}
    sort by due
    limit 10
`, currentPath);

dv.header(3, `Tasks in folder (${tasks.length})`);
dv.taskList(
    tasks.map(t => ({
        text: `${t.description} (due: ${t.due.formatAsDate('none')})`,
        completed: t.status.type === 'DONE'
    })),
    false
);
```

<!-- end-comment -->

<!-- Current output:

Evaluation Error: SyntaxError: Illegal return statement
    at DataviewInlineApi.<anonymous> (plugin:dataview:19027:21)
    at evalInContext (plugin:dataview:19028:7)
    at asyncEvalInContext (plugin:dataview:19038:32)
    at DataviewJSRenderer.render (plugin:dataview:19064:19)
    at maybeRefresh (plugin:dataview:18618:18)
    at HTMLDivElement.n (app://obsidian.md/enhance.js:1:11272)

-->
