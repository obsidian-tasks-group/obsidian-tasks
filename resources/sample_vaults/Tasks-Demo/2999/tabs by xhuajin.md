# tabs by xhuajin

## ❌ Tasks code block in Obsidian Tabs code block - by xhuajin

[GitHub - xhuajin/obsidian-tabs](https://github.com/xhuajin/obsidian-tabs)

![[Obsidian Tabs code block - by xhuajin.png]]

- Forked from [lazyloong/obsidian-code-tab](https://github.com/lazyloong/obsidian-code-tab)
- Which was forked from  [Jeromexsu/obsidian-code-tab](https://github.com/Jeromexsu/obsidian-code-tab)

~~~~tabs
tab: This folder

```tasks
not done
folder includes {{query.file.folder}}
group by filename
```
~~~~

❌ When a task is edited via the Pencil icon, all the previous code blocks are re-rendered
This suggests that the Tasks rendered ==is kept open after closure==.
