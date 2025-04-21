# js-engine by mProjectsCode - engine rendering

## ✅ Tasks code block created by JS-Engine, via engine's rendering of Markdown

<https://github.com/mProjectsCode/obsidian-js-engine-plugin>

```js-engine
const query = `
~~~tasks
not done
folder includes {{query.file.folder}}
group by filename
~~~
`;
return engine.markdown.create(query);
```

✅ When a task is edited via the Pencil icon, only one code block is re-rendered.
This suggests that the Tasks rendered is not kept open after closure.
