# Reusable Code in Custom Filters

## Custom JS way

These depend on the `customJS` variable being initialised, which is not always true if this file is loaded in Reading mode during startup.

```tasks
group by function \
    const {Tasks} = customJS; \
    return Tasks.byParentItemDescription(task);
limit 1
```

```tasks
group by function customJS.Tasks.byParentItemDescription(task);
limit 1
```

See earlier discussion:

See <https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3024#issuecomment-2285073838>.

## CodeScript Toolkit way

### Searches which always work if this file is loaded in Reading mode during startup

```tasks
group by function \
    const {parentDescription} = require('/Tasks.js'); \
    return parentDescription(task);
limit 1
```

```tasks
group by function require('/Tasks.js').parentDescription(task)
limit 1
```

### Searches usually work if this file is loaded in Reading mode during startup, and Tasks has been patched

```tasks
group by function Tasks.parentDescription(task)
limit 1
```

```tasks
group by function TasksNew.parentDescription(task)
limit 1
```

These did not initially work if this file is loaded in Reading mode during startup - because they depend on `Tasks` and `TasksNew` being initialised by the "CodeScript Toolkit" [startup script](https://github.com/mnaoumov/obsidian-codescript-toolkit?tab=readme-ov-file#startup-script), which is not always true if this code block is loaded in Reading mode during startup.

By use of [onLayoutReady()](https://docs.obsidian.md/Reference/TypeScript+API/Workspace/onLayoutReady) in Tasks main, it made this code even during startup...

This is the diff:

```diff
Index: src/main.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/main.ts b/src/main.ts
--- a/src/main.ts (revision 2493c6635db11d94379429fbed88c14323c5a7ff)
+++ b/src/main.ts (revision 00edbe4eb1283fd22a3226ea9587ad3d8ec0da98)
@@ -55,8 +55,14 @@
             workspace: this.app.workspace,
             events,
         });
-        this.inlineRenderer = new InlineRenderer({ plugin: this });
-        this.queryRenderer = new QueryRenderer({ plugin: this, events });
+
+        this.app.workspace.onLayoutReady(() => {
+            // Only execute searches once all plugins are loaded.
+            // This fixed use of a "CodeScript Toolkit" startup script inside
+            // notes that were already open in Reading mode when Obsdian was starting up.
+            this.inlineRenderer = new InlineRenderer({ plugin: this });
+            this.queryRenderer = new QueryRenderer({ plugin: this, events });
+        });
 
         this.registerEditorExtension(newLivePreviewExtension());
         this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));

```
