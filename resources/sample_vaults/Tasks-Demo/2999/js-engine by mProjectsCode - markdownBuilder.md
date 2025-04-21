# js-engine by mProjectsCode - markdownBuilder

## ✅ Tasks code block created by JS-Engine, via markdownBuilder

<https://github.com/mProjectsCode/obsidian-js-engine-plugin>

```js-engine
const markdownBuilder = engine.markdown.createBuilder();
const query = `
not done
folder includes {{query.file.folder}}
group by filename
`;
markdownBuilder.createCodeBlock('tasks', query)
return markdownBuilder;
```

✅ When a task is edited via the Pencil icon, only one code block is re-rendered.
This suggests that the Tasks rendered is not kept open after closure.
